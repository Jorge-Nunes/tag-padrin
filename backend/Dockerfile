FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

# Copy prisma schema first
COPY prisma/schema.prisma ./prisma/
COPY prisma/migrations ./prisma/migrations/

# Remove any cached prisma client and regenerate
RUN rm -rf node_modules/.prisma node_modules/@prisma/client
RUN npx prisma generate

# Copy rest of the application
COPY . .

ENV DATABASE_URL=postgresql://postgres:secret123@postgres:5432/tagpadrin

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
