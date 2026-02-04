FROM node:20-alpine

WORKDIR /app

COPY apps/api/package.json apps/api/package-lock.json* ./apps/api/
COPY prisma ./prisma

WORKDIR /app/apps/api
RUN npm install
RUN npx prisma generate --schema=../../prisma/schema.prisma

COPY apps/api/tsconfig.json ./tsconfig.json
COPY apps/api/src ./src

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]
