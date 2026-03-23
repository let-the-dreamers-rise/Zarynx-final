FROM node:22-slim

WORKDIR /app

COPY package.json package.json
RUN npm install --omit=dev

COPY server.js server.js

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "start"]
