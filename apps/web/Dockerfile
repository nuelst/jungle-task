FROM node:20-alpine

RUN npm install -g pnpm@10.15.0

RUN pnpm config set fetch-timeout 300000
RUN pnpm config set fetch-retry-mintimeout 20000
RUN pnpm config set fetch-retry-maxtimeout 120000
RUN pnpm config set fetch-retries 5

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile

COPY apps/web/ ./apps/web/

ENV NODE_ENV=development

WORKDIR /app/apps/web

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "preview", "--host", "0.0.0.0"]