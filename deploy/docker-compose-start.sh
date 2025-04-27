#!/bin/bash

# Данный файл необходимо для корректного запуска docker compose и проверки наличия файла с секретом,
# который нужен для запуска и инициализации контейнера mssql.
# Очень важно: данный файл должен быть в LF окончании строк.

SECRET_FILE="sa_password.txt"

# Проверка наличия файла с секретом
if [ ! -f $SECRET_FILE ]; then
  echo "Ошибка: файл $SECRET_FILE не найден." >&2
  echo "Создайте его в текущей директории (messanger/deploy) и добавьте пароль администратора для SQL Server." >&2
  echo "Пример из корня проекта: cd deploy && echo -n 'your_secure_password' > $SECRET_FILE" >&2
  exit 1
fi

# Запуск Docker Compose
docker compose up