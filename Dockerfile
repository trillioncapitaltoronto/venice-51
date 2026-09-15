FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
ENV VITE_AUTH_ENABLED=false
ENV NITRO_PRESET=node-server
RUN npm run build \
  && mkdir -p .output/server/_libs \
  && cp node_modules/@electric-sql/pglite/dist/pglite.data .output/server/_libs/ \
  && cp node_modules/@electric-sql/pglite/dist/pglite.wasm .output/server/_libs/ \
  && cp node_modules/@electric-sql/pglite/dist/initdb.wasm .output/server/_libs/
ENV PORT=10000
EXPOSE 10000
CMD ["node", ".output/server/index.mjs"]
