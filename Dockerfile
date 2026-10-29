FROM oven/bun:1.4.4-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.4.4-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json /app/bun.lock ./
RUN bun install --production --frozen-lockfile
EXPOSE 3000
CMD ["bun", "./build"]
