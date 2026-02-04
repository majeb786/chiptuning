import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const dataDir = path.resolve(process.cwd(), 'data');

const loadCsv = <T extends Record<string, string>>(file: string): T[] => {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[];
};

const toNumber = (value: string | undefined) => {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const run = async () => {
  const brands = loadCsv<{ id: string; name: string; logo_url?: string }>('brands.csv');
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { id: brand.id },
      update: { name: brand.name, logoUrl: brand.logo_url || null },
      create: { id: brand.id, name: brand.name, logoUrl: brand.logo_url || null },
    });
  }

  const models = loadCsv<{ id: string; brand_id: string; name: string }>('models.csv');
  for (const model of models) {
    await prisma.model.upsert({
      where: { id: model.id },
      update: { name: model.name, brandId: model.brand_id },
      create: { id: model.id, name: model.name, brandId: model.brand_id },
    });
  }

  const builds = loadCsv<{ id: string; model_id: string; name: string; year_from?: string; year_to?: string }>('builds.csv');
  for (const build of builds) {
    await prisma.build.upsert({
      where: { id: build.id },
      update: {
        name: build.name,
        modelId: build.model_id,
        yearFrom: toNumber(build.year_from),
        yearTo: toNumber(build.year_to),
      },
      create: {
        id: build.id,
        name: build.name,
        modelId: build.model_id,
        yearFrom: toNumber(build.year_from),
        yearTo: toNumber(build.year_to),
      },
    });
  }

  const engines = loadCsv<{
    id: string;
    build_id: string;
    name: string;
    engine_code: string;
    fuel_type?: string;
    displacement_cc?: string;
    ecu?: string;
    compression_ratio?: string;
    bore_mm?: string;
    stroke_mm?: string;
    turbo_type?: string;
    engine_number?: string;
  }>('engines.csv');
  for (const engine of engines) {
    await prisma.engine.upsert({
      where: { id: engine.id },
      update: {
        name: engine.name,
        buildId: engine.build_id,
        engineCode: engine.engine_code,
        fuelType: engine.fuel_type || null,
        displacementCc: toNumber(engine.displacement_cc),
        ecu: engine.ecu || null,
        compressionRatio: engine.compression_ratio || null,
        boreMm: toNumber(engine.bore_mm),
        strokeMm: toNumber(engine.stroke_mm),
        turboType: engine.turbo_type || null,
        engineNumber: engine.engine_number || null,
      },
      create: {
        id: engine.id,
        name: engine.name,
        buildId: engine.build_id,
        engineCode: engine.engine_code,
        fuelType: engine.fuel_type || null,
        displacementCc: toNumber(engine.displacement_cc),
        ecu: engine.ecu || null,
        compressionRatio: engine.compression_ratio || null,
        boreMm: toNumber(engine.bore_mm),
        strokeMm: toNumber(engine.stroke_mm),
        turboType: engine.turbo_type || null,
        engineNumber: engine.engine_number || null,
      },
    });
  }

  const stages = loadCsv<{
    id: string;
    engine_id: string;
    name: string;
    stock_hp: string;
    tuned_hp: string;
    stock_nm: string;
    tuned_nm: string;
    tuning_type: string;
    method: string;
    price_cents?: string;
    notes?: string;
  }>('stages.csv');
  for (const stage of stages) {
    await prisma.stage.upsert({
      where: { id: stage.id },
      update: {
        engineId: stage.engine_id,
        name: stage.name,
        stockHp: Number(stage.stock_hp),
        tunedHp: Number(stage.tuned_hp),
        stockNm: Number(stage.stock_nm),
        tunedNm: Number(stage.tuned_nm),
        tuningType: stage.tuning_type,
        method: stage.method,
        priceCents: toNumber(stage.price_cents),
        notes: stage.notes || null,
      },
      create: {
        id: stage.id,
        engineId: stage.engine_id,
        name: stage.name,
        stockHp: Number(stage.stock_hp),
        tunedHp: Number(stage.tuned_hp),
        stockNm: Number(stage.stock_nm),
        tunedNm: Number(stage.tuned_nm),
        tuningType: stage.tuning_type,
        method: stage.method,
        priceCents: toNumber(stage.price_cents),
        notes: stage.notes || null,
      },
    });
  }

  const readMethods = loadCsv<{ id: string; engine_id: string; name: string }>('read_methods.csv');
  for (const method of readMethods) {
    await prisma.readMethod.upsert({
      where: { id: method.id },
      update: { engineId: method.engine_id, name: method.name },
      create: { id: method.id, engineId: method.engine_id, name: method.name },
    });
  }

  const options = loadCsv<{ id: string; engine_id: string; name: string; category: string; is_enabled?: string }>('options.csv');
  for (const option of options) {
    await prisma.option.upsert({
      where: { id: option.id },
      update: {
        engineId: option.engine_id,
        name: option.name,
        category: option.category,
        isEnabled: option.is_enabled ? option.is_enabled === 'true' : true,
      },
      create: {
        id: option.id,
        engineId: option.engine_id,
        name: option.name,
        category: option.category,
        isEnabled: option.is_enabled ? option.is_enabled === 'true' : true,
      },
    });
  }
};

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
