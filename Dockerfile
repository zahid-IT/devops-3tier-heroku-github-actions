FROM node:18-alpine

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies including pg
RUN npm install --omit=dev

# Copy source code
COPY . .

ENV NODE_ENV=production

EXPOSE 5006

CMD ["node", "index.js"]
