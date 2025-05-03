#!/bin/bash

# Данный файл необходимо для проверки доступности SQL Server. Он используется в healthcheck контейнера mssql
# и сигнализирует о том, что контейнер заработал.
# Очень важно: данный файл должен быть в LF окончании строк.

# Получаем переменную пароля администратора БД из Docker Secrets и обрезаем символы перевода строки (на всякий случай)
SA_PASSWORD=$(cat /run/secrets/sa_password)

# Делаем  переменную доступной для всех последующих скриптов выполнения в контейнере (в том числе в текущем файле)
export SA_PASSWORD

echo "Test healthcheck mssql service..."

# Проверяем доступность SQL Server
if /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -Q "SELECT 1" > /dev/null; then
  exit 0
else
  exit 1
fi