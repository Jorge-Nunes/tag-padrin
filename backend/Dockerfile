FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
COPY . .

ENV DATABASE_URL=postgresql://postgres:secret123@postgres:5432/tagpadrin
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
