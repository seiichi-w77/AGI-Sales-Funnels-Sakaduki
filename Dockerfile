# AGI-Sales-Funnels-Sakaduki Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./

# Set DATABASE_URL for Prisma generate (will be overridden at runtime)
ARG DATABASE_URL=postgresql://localhost:5432/dummy
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (if needed for future web server)
EXPOSE 3000

# Default command
CMD ["npm", "run", "dev"]
