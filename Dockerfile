# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install deps
RUN npm install

# Copy project files
COPY . .

# Build app
RUN npm run build


# Production stage
FROM nginx:alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]