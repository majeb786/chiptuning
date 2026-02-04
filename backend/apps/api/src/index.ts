import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

await fastify.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigin === '*') {
      cb(null, true);
      return;
    }
    if (origin === allowedOrigin) {
      cb(null, true);
      return;
    }
    cb(new Error('Not allowed'), false);
  },
});

const isUuid = (value?: string) => {
  if (!value) {
    return false;
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

fastify.get('/v1/health', async () => {
  return { status: 'ok' };
});

fastify.get('/v1/brands', async () => {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, logoUrl: true },
  });
  return brands;
});

fastify.get('/v1/models', async (request, reply) => {
  const brandId = (request.query as { brandId?: string }).brandId;
  if (!isUuid(brandId)) {
    reply.code(400);
    return { error: 'Invalid brandId' };
  }
  const models = await prisma.model.findMany({
    where: { brandId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  return models;
});

fastify.get('/v1/builds', async (request, reply) => {
  const modelId = (request.query as { modelId?: string }).modelId;
  if (!isUuid(modelId)) {
    reply.code(400);
    return { error: 'Invalid modelId' };
  }
  const builds = await prisma.build.findMany({
    where: { modelId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, yearFrom: true, yearTo: true },
  });
  return builds;
});

fastify.get('/v1/engines', async (request, reply) => {
  const buildId = (request.query as { buildId?: string }).buildId;
  if (!isUuid(buildId)) {
    reply.code(400);
    return { error: 'Invalid buildId' };
  }
  const engines = await prisma.engine.findMany({
    where: { buildId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, engineCode: true },
  });
  return engines;
});

fastify.get('/v1/config', async (request, reply) => {
  const engineId = (request.query as { engineId?: string }).engineId;
  if (!isUuid(engineId)) {
    reply.code(400);
    return { error: 'Invalid engineId' };
  }

  const engine = await prisma.engine.findUnique({
    where: { id: engineId },
    include: {
      stages: true,
      readMethods: true,
      options: true,
    },
  });

  if (!engine) {
    reply.code(404);
    return { error: 'Engine not found' };
  }

  const stages = engine.stages.map((stage) => {
    const gainHp = stage.tunedHp - stage.stockHp;
    const gainNm = stage.tunedNm - stage.stockNm;
    const gainHpPct = stage.stockHp > 0 ? Number(((gainHp / stage.stockHp) * 100).toFixed(2)) : 0;
    const gainNmPct = stage.stockNm > 0 ? Number(((gainNm / stage.stockNm) * 100).toFixed(2)) : 0;

    return {
      id: stage.id,
      name: stage.name,
      stock: { hp: stage.stockHp, nm: stage.stockNm },
      tuned: { hp: stage.tunedHp, nm: stage.tunedNm },
      gain: { hp: gainHp, nm: gainNm, hpPct: gainHpPct, nmPct: gainNmPct },
      priceCents: stage.priceCents,
      notes: stage.notes,
      method: stage.method,
      tuningType: stage.tuningType,
    };
  });

  return {
    stages,
    technical: {
      fuelType: engine.fuelType,
      displacementCc: engine.displacementCc,
      ecu: engine.ecu,
      compressionRatio: engine.compressionRatio,
      boreMm: engine.boreMm,
      strokeMm: engine.strokeMm,
      turboType: engine.turboType,
      engineNumber: engine.engineNumber,
      engineCode: engine.engineCode,
    },
    readMethods: engine.readMethods.map((method) => method.name),
    options: engine.options.map((option) => ({
      name: option.name,
      category: option.category,
      enabled: option.isEnabled,
    })),
  };
});

fastify.post('/v1/leads', async (request, reply) => {
  const body = request.body as {
    engineId?: string;
    stageId?: string;
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    consent?: boolean;
    meta?: Record<string, unknown>;
  };

  if (!isUuid(body.engineId) || !isUuid(body.stageId)) {
    reply.code(400);
    return { error: 'Invalid engineId or stageId' };
  }

  if (!body.name || !body.email || !body.consent) {
    reply.code(400);
    return { error: 'Missing required fields' };
  }

  const lead = await prisma.lead.create({
    data: {
      engineId: body.engineId,
      stageId: body.stageId,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      message: body.message || null,
      consent: body.consent,
      metaJson: body.meta || {},
    },
  });

  reply.code(201);
  return { id: lead.id };
});

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || '0.0.0.0';

fastify.listen({ port, host }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
