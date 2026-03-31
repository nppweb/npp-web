FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_GRAPHQL_ENDPOINT=/graphql
ENV VITE_GRAPHQL_ENDPOINT=${VITE_GRAPHQL_ENDPOINT}

COPY package.json package-lock.json* ./
RUN npm ci

COPY index.html tsconfig.json tsconfig.app.json tsconfig.base.json tsconfig.node.json vite.config.ts ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
