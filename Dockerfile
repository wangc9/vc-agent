FROM node:22-alpine as frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
ENV VITE_BACKEND_URL="/api" 
RUN npm run build

FROM node:22-alpine as backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run build 

FROM node:22-alpine
WORKDIR /app

COPY --from=backend-builder /app/server/package*.json ./
COPY --from=backend-builder /app/server/node_modules ./node_modules

COPY --from=backend-builder /app/server/dist ./dist
COPY --from=backend-builder /app/server/config.js ./config.js

COPY --from=frontend-builder /app/client/dist ./public/dist

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "-r", "./config.js", "dist/main.js"]