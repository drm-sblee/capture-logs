FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV PORT=5000
EXPOSE 5000
CMD ["npm", "start"]