import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const run = async () => {
  const brandId = '11111111-1111-1111-1111-111111111111';
  const modelId = '22222222-2222-2222-2222-222222222222';
  const buildId = '33333333-3333-3333-3333-333333333333';
  const engineId = '44444444-4444-4444-4444-444444444444';
  const stageId = '55555555-5555-5555-5555-555555555555';

  await prisma.brand.upsert({
    where: { id: brandId },
    update: { name: 'Audi' },
    create: { id: brandId, name: 'Audi' },
  });

  await prisma.model.upsert({
    where: { id: modelId },
    update: { name: 'A4', brandId },
    create: { id: modelId, name: 'A4', brandId },
  });

  await prisma.build.upsert({
    where: { id: buildId },
    update: { name: 'B9 2015-2020', modelId, yearFrom: 2015, yearTo: 2020 },
    create: { id: buildId, name: 'B9 2015-2020', modelId, yearFrom: 2015, yearTo: 2020 },
  });

  await prisma.engine.upsert({
    where: { id: engineId },
    update: {
      name: '2.0 TFSI',
      buildId,
      engineCode: 'EA888',
      fuelType: 'Petrol',
      displacementCc: 1984,
      ecu: 'Bosch MED',
      compressionRatio: '9.6:1',
      boreMm: 82.5,
      strokeMm: 92.8,
      turboType: 'Twin-scroll',
      engineNumber: 'EA888-Gen3',
    },
    create: {
      id: engineId,
      name: '2.0 TFSI',
      buildId,
      engineCode: 'EA888',
      fuelType: 'Petrol',
      displacementCc: 1984,
      ecu: 'Bosch MED',
      compressionRatio: '9.6:1',
      boreMm: 82.5,
      strokeMm: 92.8,
      turboType: 'Twin-scroll',
      engineNumber: 'EA888-Gen3',
    },
  });

  await prisma.stage.upsert({
    where: { id: stageId },
    update: {
      engineId,
      name: 'Stage 1',
      stockHp: 190,
      tunedHp: 245,
      stockNm: 320,
      tunedNm: 390,
      tuningType: 'ECU',
      method: 'OBD',
      priceCents: 49900,
      notes: 'Optimized for 98 RON fuel',
    },
    create: {
      id: stageId,
      engineId,
      name: 'Stage 1',
      stockHp: 190,
      tunedHp: 245,
      stockNm: 320,
      tunedNm: 390,
      tuningType: 'ECU',
      method: 'OBD',
      priceCents: 49900,
      notes: 'Optimized for 98 RON fuel',
    },
  });

  await prisma.readMethod.createMany({
    data: [
      { id: '66666666-6666-6666-6666-666666666666', engineId, name: 'Autotuner' },
      { id: '77777777-7777-7777-7777-777777777777', engineId, name: 'KESS V2' },
    ],
    skipDuplicates: true,
  });

  await prisma.option.createMany({
    data: [
      { id: '88888888-8888-8888-8888-888888888888', engineId, name: 'DPF Off', category: 'Abgas', isEnabled: true },
      { id: '99999999-9999-9999-9999-999999999999', engineId, name: 'Start/Stop', category: 'Komfort', isEnabled: true },
    ],
    skipDuplicates: true,
  });
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
