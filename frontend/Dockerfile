FROM node:20-alpine AS build

WORKDIR /app

# Копируем только package files для кеширования dependencies
COPY package*.json ./
RUN npm ci

# Копируем исходники (БЕЗ node_modules и dist благодаря .dockerignore)
COPY . .

# Build environment
ARG VITE_API_URL=https://api.shelternearyou.online
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_HCAPTCHA_SITE_KEY
ENV VITE_HCAPTCHA_SITE_KEY=$VITE_HCAPTCHA_SITE_KEY

# Build приложения
RUN npm run build

# Production stage
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]