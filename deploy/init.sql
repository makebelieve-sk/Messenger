-- Начальный SQL код, который запускается при создании образа MSSQL Server 2019 в контейнере Docker
-- Является шаблоном, в котором заменяются env переменные

-- Все операции с логинами выполняем в контексте master
USE [master];
GO

-- Создаем логин (серверный уровень)
IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = '${DATEBASE_USERNAME}')
BEGIN
    CREATE LOGIN [${DATEBASE_USERNAME}] 
    WITH PASSWORD = '${DATEBASE_PASSWORD}', 
    CHECK_POLICY = OFF;  -- Отключаем проверку политики паролей
END;
GO

-- Права на подключение к серверу
GRANT CONNECT SQL TO [${DATEBASE_USERNAME}];
GO

-- Создаем базу данных
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${DATEBASE_NAME}')
BEGIN
    CREATE DATABASE [${DATEBASE_NAME}];
END;
GO

-- Переключаемся на целевую БД
USE [${DATEBASE_NAME}];
GO

-- Создаем пользователя (уровень БД)
CREATE USER [${DATEBASE_USERNAME}] FOR LOGIN [${DATEBASE_USERNAME}];
GO

-- Назначаем права
ALTER ROLE [db_owner] ADD MEMBER [${DATEBASE_USERNAME}];
GO