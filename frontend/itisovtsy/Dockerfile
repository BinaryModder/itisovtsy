FROM node:24-bookworm-slim AS build
WORKDIR /app

RUN npm install --global bun@1.3.1

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . ./
RUN bun run build

FROM nginx:1.28-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
