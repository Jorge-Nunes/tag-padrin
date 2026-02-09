FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma Client and build app
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://postgres:secret123@postgres:5432/tagpadrin

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
