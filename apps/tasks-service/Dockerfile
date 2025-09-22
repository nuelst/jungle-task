FROM node:20-alpine

RUN npm install -g pnpm@10.15.0

RUN pnpm config set fetch-timeout 300000
RUN pnpm config set fetch-retry-mintimeout 20000
RUN pnpm config set fetch-retry-maxtimeout 120000
RUN pnpm config set fetch-retries 5

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/tasks-service/package.json ./apps/tasks-service/

RUN pnpm install --frozen-lockfile

COPY apps/tasks-service/ ./apps/tasks-service/

WORKDIR /app/apps/tasks-service
RUN pnpm run build

EXPOSE 3003

CMD ["pnpm", "run", "start:prod"]

