#!/bin/bash

# Данный файл необходим для того, чтобы запустить SQL Server и вызвать скрипт SQL инициализации нашей базы данных
# внутри MSSQL контейнера. Выполняется при старте контейнера mssql.

# Прерывает выполнение скрипта, если любая команда завершится с ошибкой
set -e

# Получаем переменную пароля администратора БД из Docker Secrets и обрезаем символы перевода строки (на всякий случай)
SA_PASSWORD=$(cat /run/secrets/sa_password | tr -d "\r\n")

# Делаем  переменную доступной для всех последующих скриптов выполнения в контейнере (в том числе в текущем файле)
export SA_PASSWORD

# Запускаем SQL Server в фоне
/opt/mssql/bin/sqlservr &

# Ждем запуска сервера
echo "Waiting for SQL Server to start..."

# Ждем ответа от контейнера mssql (необходимо для того, чтобы после успешного старта mssql выполнить скрипт SQL)
until /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" &> /dev/null
do
  sleep 1
done

# Подставляем переменные в SQL шаблон /docker-entrypoint-initdb.d/init.sql.template) и сохраняем в файл /docker-entrypoint-initdb.d/init.sql
envsubst < /docker-entrypoint-initdb.d/init.sql.template > /docker-entrypoint-initdb.d/init.sql

# Выполняем SQL скрипт (из файла, который только что создали на основе шаблона)
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -i /docker-entrypoint-initdb.d/init.sql

echo "Initialization completed!"

# Ожидаем завершения основного процесса
wait