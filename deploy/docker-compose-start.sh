#!/bin/bash

# Данный файл необходимо для корректного запуска docker compose и проверки наличия файла с секретом,
# который нужен для запуска и инициализации контейнера mssql.
# Очень важно: данный файл должен быть в LF окончании строк.

# Также, очень важно: при команде ./docker-compose-start.sh переменная окружения автоматически берется равной development,
# если не указать другое значение. Для того, чтобы запустить docker compose в production режиме, необходимо указать следующую команду:
# MESSANGER_ENV=production ./docker-compose-start.sh
# В PaaS (Heroku/Vercel/Render/etc) переменная окружения устанавливается в разделе "Environment Variables". Также, должна быть прописанной строка запуска:
# bash ./docker-compose.start.sh в разделе "Start Command" (команда запуска приложения).

set -euo pipefail

SECRET_FILE="sa_password.txt"

# Проверка наличия файла с секретом
if [ ! -f $SECRET_FILE ]; then
  echo "Ошибка: файл $SECRET_FILE не найден." >&2
  echo "Создайте его в текущей директории (messanger/deploy) и добавьте пароль администратора для SQL Server." >&2
  echo "Пример из корня проекта: cd deploy && echo -n 'your_secure_password' > $SECRET_FILE" >&2
  exit 1
fi

# Выбираем compose-файл по MESSANGER_ENV (по умолчанию stage)
# Для запуска в режиме production использовать команду MESSANGER_ENV=production ./docker-compose-start.sh
ENVIRONMENT="${MESSANGER_ENV:-stage}"
echo "MESSANGER_ENV=$ENVIRONMENT"

if [ "$ENVIRONMENT" != "production" ]; then
  CERT_DIR="../services/main/certs"
  CERT_CHAIN="$CERT_DIR/localhost.pem"
  CERT_KEY="$CERT_DIR/localhost-key.pem"

  missing=()
  [ ! -d "$CERT_DIR" ]       && missing+=("directory $CERT_DIR")
  [ ! -f "$CERT_CHAIN" ]     && missing+=("file $CERT_CHAIN")
  [ ! -f "$CERT_KEY" ]       && missing+=("file $CERT_KEY")

  if [ ${#missing[@]} -gt 0 ]; then
    echo "Ошибка: не найдены сертификаты для $ENVIRONMENT режима:" >&2

    for item in "${missing[@]}"; do
      echo "  • $item" >&2
    done

    echo
    echo "В папке services/main сгенерируйте локальные сертификаты командой:" >&2
    echo " cd $CERT_DIR && mkcert -cert-file localhost.pem -key-file localhost-key.pem localhost 127.0.0.1 ::1" >&2
    exit 1
  fi
  echo "[$ENVIRONMENT] Сертификаты найдены успешно."
fi

# Выбираем compose-файл по MESSANGER_ENV (по умолчанию development → docker-compose.dev.yml)
if [ "$ENVIRONMENT" = "production" ]; then
  COMPOSE_FILE="docker-compose.yml"
else
  COMPOSE_FILE="docker-compose.dev.yml"
fi

echo "MESSANGER_ENV=$ENVIRONMENT → собираем сервисы через $COMPOSE_FILE"

# Запуск Docker Compose с нужным файлом
docker compose -f "../$COMPOSE_FILE" up --build