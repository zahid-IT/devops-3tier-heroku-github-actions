# Use official Node LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy remaining project files
COPY . .

# Expose port (Heroku app uses 5000)
EXPOSE 5006

# Start the app
CMD ["npm", "start"]
