# Используем Node.js для сборки клиентского приложения (18 версия - потому что она стабильна и ее можно безопасно использовать в продакшене)
FROM node:22 AS build

# Устанавливаем рабочую директорию внутри контейнера для клиента (все последующие команды выполняются внутри этой папки)
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код клиента в контейнер
COPY . .

# Копируем файлы .env в контейнер (они нужны перед сборкой, так что не нужно прокидывать их через docker-compose.yml)
COPY .env ./
COPY .env.production ./

# Запускаем сборку клиента
RUN npm run build

#  Формирование финального образа на базе Nginx
FROM nginx:alpine

# Устанавливаем рабочую директорию внутри контейнера для Nginx
WORKDIR /root 

 # Копируем собранные файлы из предыдущего этапа
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфигурацию Nginx 
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]