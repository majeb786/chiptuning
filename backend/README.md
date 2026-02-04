# Tuning Configurator Backend

Node.js 20 + TypeScript + Fastify API with PostgreSQL and Prisma.

## Quick start

```bash
docker compose up --build
```

Once running, the API is available at `http://localhost:8080/v1/health`.

## Environment

- `DATABASE_URL` (required)
- `ALLOWED_ORIGIN` (default `*`)
- `PORT` (default `8080`)

## Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Seed demo data

```bash
npm install
npm run seed
```

## CSV import

Place CSV files in `backend/data` and run:

```bash
npm install
npm run import
```

### CSV columns

**brands.csv**
- `id` (uuid)
- `name`
- `logo_url`

**models.csv**
- `id` (uuid)
- `brand_id`
- `name`

**builds.csv**
- `id` (uuid)
- `model_id`
- `name`
- `year_from`
- `year_to`

**engines.csv**
- `id` (uuid)
- `build_id`
- `name`
- `engine_code`
- `fuel_type`
- `displacement_cc`
- `ecu`
- `compression_ratio`
- `bore_mm`
- `stroke_mm`
- `turbo_type`
- `engine_number`

**stages.csv**
- `id` (uuid)
- `engine_id`
- `name`
- `stock_hp`
- `tuned_hp`
- `stock_nm`
- `tuned_nm`
- `tuning_type`
- `method`
- `price_cents`
- `notes`

**read_methods.csv**
- `id` (uuid)
- `engine_id`
- `name`

**options.csv**
- `id` (uuid)
- `engine_id`
- `name`
- `category`
- `is_enabled` (true/false)

## API Endpoints

- `GET /v1/health`
- `GET /v1/brands`
- `GET /v1/models?brandId=`
- `GET /v1/builds?modelId=`
- `GET /v1/engines?buildId=`
- `GET /v1/config?engineId=`
- `POST /v1/leads`

## Notes

- CORS is permissive for development. Set `ALLOWED_ORIGIN` in production.
- External provider adapters are stubbed in `apps/api/src/providers`.
