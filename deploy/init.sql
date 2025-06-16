-- Начальный SQL код, который запускается при создании образа MSSQL Server 2019 в контейнере Docker
-- Является шаблоном, в котором заменяются env переменные

-- Все операции с логинами выполняем в контексте master
USE [master];
GO

-- Создаем логин (серверный уровень)
IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = '${DATABASE_USERNAME}')
BEGIN
    CREATE LOGIN [${DATABASE_USERNAME}] 
    WITH PASSWORD = '${DATABASE_PASSWORD}', 
    CHECK_POLICY = OFF;  -- Отключаем проверку политики паролей
END;
GO

-- Права на подключение к серверу
GRANT CONNECT SQL TO [${DATABASE_USERNAME}];
GO

-- Создаем базу данных
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${DATABASE_NAME}')
BEGIN
    CREATE DATABASE [${DATABASE_NAME}];
END;
GO

-- Переключаемся на целевую БД
USE [${DATABASE_NAME}];
GO

-- Создаем пользователя (уровень БД)
CREATE USER [${DATABASE_USERNAME}] FOR LOGIN [${DATABASE_USERNAME}];
GO

-- Назначаем права
ALTER ROLE [db_owner] ADD MEMBER [${DATABASE_USERNAME}];
GO