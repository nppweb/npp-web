FROM node:20-alpine AS build
WORKDIR /app

ARG NUXT_PUBLIC_GRAPHQL_ENDPOINT=/graphql
ENV NUXT_PUBLIC_GRAPHQL_ENDPOINT=${NUXT_PUBLIC_GRAPHQL_ENDPOINT}

COPY package.json package-lock.json* ./
RUN npm ci --fetch-retries 5 --fetch-retry-mintimeout 20000 --fetch-retry-maxtimeout 120000

COPY app.vue nuxt.config.ts tailwind.config.ts tsconfig.json ./
COPY assets ./assets
COPY components ./components
COPY composables ./composables
COPY graphql ./graphql
COPY layouts ./layouts
COPY middleware ./middleware
COPY pages ./pages
COPY plugins ./plugins
COPY types ./types
COPY utils ./utils

RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

COPY --from=build /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
