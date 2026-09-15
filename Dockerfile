FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
ENV VITE_AUTH_ENABLED=false
RUN npm run build
ENV PORT=10000
EXPOSE 10000
CMD ["npm", "start"]
