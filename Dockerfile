FROM oven/bun:1-slim

WORKDIR /app

ENV PATH="/app/node_modules/.bin:${PATH}"

COPY package.json bun.lockb ./
RUN bun install

COPY . .

RUN bunx prisma generate

EXPOSE 3333

CMD ["bun", "src/dev.ts"]
