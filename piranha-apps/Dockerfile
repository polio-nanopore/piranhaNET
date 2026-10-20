# Stage 1: Build
FROM node:24.9.0-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build-web

# Stage 2: Runtime
FROM node:24.9.0-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/piranha-web/dist ./dist

EXPOSE 5173

# Serve the built app
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]
