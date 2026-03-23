FROM node:20-alpine AS build

WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./
RUN npm ci

# Copy source code (node_modules and dist excluded via .dockerignore)
COPY . .

# Build environment variables
ARG VITE_API_URL=https://api.shelternearyou.online
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_HCAPTCHA_SITE_KEY
ENV VITE_HCAPTCHA_SITE_KEY=$VITE_HCAPTCHA_SITE_KEY

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]