# Устанавливаем образ Node.js для Debian (22 версия - потому что она стабильна и ее можно безопасно использовать в продакшене)
FROM node:22

# Устанавливаем рабочую директорию в контейнере
WORKDIR /main-server

# Копируем package.json и общие пакеты
COPY services/main/package*.json    ./services/main/
COPY packages/common-types          ./packages/common-types/
COPY packages/validation            ./packages/validation/

# Устанавливаем зависимости для модулей пакетов
RUN cd packages/common-types && npm install && cd ../validation && npm install

# Устанавливаем зависимости (запрещаем изменять версии пакетов. Строгое соответствие версий пакетов из package и package-lock)
RUN cd services/main && npm install --frozen-lockfile

# Устанавливаем curl (необходим для healthcheck контейнера)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Копируем серверный код
COPY . .

# Уходим в рабочую директорию
WORKDIR /main-server/services/main

# Запускаем сборку сервера (без запуска сервера)
RUN npm run build

# Открываем порт 5050 для доступа (внутренний порт контейнера)
EXPOSE 5050

# Запускаем сборку сервера
CMD ["npm", "run", "start:production"]