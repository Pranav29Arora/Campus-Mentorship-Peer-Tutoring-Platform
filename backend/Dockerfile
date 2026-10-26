# Node.js 18 Alpine Base Image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose server port
EXPOSE 5001

# Start the Express + WebRTC signaling server
CMD ["node", "src/server.js"]
