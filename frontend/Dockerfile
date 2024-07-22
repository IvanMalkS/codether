# Stage 1: Build the application
FROM node:16 AS builder

# Set working directory
WORKDIR /app

# Install specific Yarn version
RUN npm install -g yarn@1.22.22

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy project files
COPY . .

# Build the application
RUN yarn build

# Stage 2: Setup production environment
FROM node:16-slim

# Set working directory
WORKDIR /app

# Install specific Yarn version
RUN npm install -g yarn@1.22.22

# Copy built assets from the builder stage
COPY --from=builder /app/.output ./.output

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --production

# Expose port (Nuxt default is 3000)
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]