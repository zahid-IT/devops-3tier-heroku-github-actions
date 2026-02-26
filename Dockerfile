# Use official Node.js 18 alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install build tools for native modules like 'pg'
RUN apk add --no-cache python3 make g++ libc-dev postgresql-dev

# Copy package files first (for caching)
COPY package*.json ./

# Install all dependencies (including pg)
RUN npm install --production

# Copy application code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Expose application port
EXPOSE 5006

# Start the app directly
CMD ["node", "index.js"]
