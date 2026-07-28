# Use official Node.js LTS image
FROM node:20-alpine

# Create working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy application source
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["npm", "start"]