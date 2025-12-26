# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the development server with host flag for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

