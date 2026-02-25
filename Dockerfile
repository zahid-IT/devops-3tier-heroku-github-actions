FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose app port
EXPOSE 5006

# Run application
CMD ["npm", "start"]

