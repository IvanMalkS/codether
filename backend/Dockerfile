# Stage 1: Build the application
FROM node:14 AS builder
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Stage 2: Run the application
FROM node:14
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json yarn.lock ./
EXPOSE 8000
CMD ["node", "dist/main"]