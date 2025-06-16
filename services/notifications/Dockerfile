# Устанавливаем образ Node.js для Debian (22 версия - потому что она стабильна и ее можно безопасно использовать в продакшене)
FROM node:22

# Устанавливаем рабочую директорию в контейнере
WORKDIR /notifications-server

RUN mkdir -p /notifications-server/services/notifications

# Копируем package.json
COPY services/notifications/package*.json    ./services/notifications/

# Устанавливаем зависимости (запрещаем изменять версии пакетов. Строгое соответствие версий пакетов из package и package-lock)
RUN cd services/notifications && npm install --frozen-lockfile

# Устанавливаем curl (необходим для healthcheck контейнера)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Копируем серверный код
COPY . .

# Уходим в рабочую директорию
WORKDIR /notifications-server/services/notifications

# Запускаем сборку сервера (без запуска сервера)
RUN npm run build

# Открываем порт 5051 для доступа (внутренний порт контейнера)
EXPOSE 5051

CMD ["sh", "-c", "npm run migration:run && npm run start:production"]