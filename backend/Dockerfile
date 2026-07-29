# Use official Node.js LTS image
FROM node:20-alpine

# Create working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN apk upgrade --no-cache \
    && npm install --omit=dev \
    && npm cache clean --force

# Copy application source
COPY . .

# Allow the non-root Node.js user to write uploaded files
RUN mkdir -p /app/uploads && chown -R node:node /app


# npm is only needed while building; remove it from the runtime image
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx

# Run the application without root privileges
USER node

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]