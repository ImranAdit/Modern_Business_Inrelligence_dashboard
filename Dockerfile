FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install --production

# Copy all app files
COPY . .

# Expose port (Railway injects $PORT at runtime)
EXPOSE 3000

CMD ["node", "server.js"]
