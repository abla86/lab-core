FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.js ./
COPY index.html ./
COPY css ./css
COPY js ./js
USER node
EXPOSE 3000
CMD ["node","server.js"]
