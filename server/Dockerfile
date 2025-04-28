# Устанавливаем образ Node.js для Debian (22 версия - потому что она стабильна и ее можно безопасно использовать в продакшене)
FROM node:22

# Устанавливаем рабочую директорию в контейнере
WORKDIR /server

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./

# Устанавливаем зависимости (кроме devDependencies)
RUN npm install --omit=dev

# Устанавливаем curl (необходим для healthcheck контейнера)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Копируем серверный код
COPY . .

# Запускаем сборку сервера (без запуска сервера)
RUN npm run build

# Открываем порт 5050 для доступа (внутренний порт контейнера)
EXPOSE 5050

# Запускаем сборку сервера
CMD ["npm", "run", "start:production"]