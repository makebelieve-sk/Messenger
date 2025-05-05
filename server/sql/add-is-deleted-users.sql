-- Добавляем колонку is_deleted, если её нет
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'Users') AND name = N'is_deleted'
)
BEGIN
    ALTER TABLE dbo.Users ADD is_deleted BIT CONSTRAINT DF_Users_is_deleted DEFAULT (0);
END;

-- Удаляем старые UNIQUE-ограничения и индексы

-- Почта: constraint (ограничение) и индекс
IF EXISTS (
    SELECT 1 
    FROM sys.key_constraints
    WHERE name = 'UQ_Users_Email' AND parent_object_id = OBJECT_ID(N'Users')
)
BEGIN
    ALTER TABLE dbo.Users DROP CONSTRAINT UQ_Users_Email;
END;

IF EXISTS (
    SELECT 1 
    FROM sys.indexes
    WHERE name = 'IDX_Users_Email' AND object_id = OBJECT_ID(N'Users')
)
BEGIN
    DROP INDEX IDX_Users_Email ON dbo.Users;
END;

-- Телефон: constraint и индекс
IF EXISTS (
    SELECT 1 
    FROM sys.key_constraints
    WHERE name = 'UQ_Users_Phone' AND parent_object_id = OBJECT_ID(N'Users')
)
BEGIN
    ALTER TABLE dbo.Users DROP CONSTRAINT UQ_Users_Phone;
END;

IF EXISTS (
    SELECT 1 
    FROM sys.indexes
    WHERE name = 'IDX_Users_Phone' AND object_id = OBJECT_ID(N'Users')
)
BEGIN
    DROP INDEX IDX_Users_Phone ON dbo.Users;
END;

-- Создаём новые фильтрованные уникальные индексы
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes
    WHERE name = 'UQ_Users_Active_Email' AND object_id = OBJECT_ID(N'Users')
)
BEGIN
    CREATE UNIQUE INDEX UQ_Users_Active_Email
    ON dbo.Users(email)
    WHERE is_deleted = 0;
END;

IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes
    WHERE name = 'UQ_Users_Active_Phone' AND object_id = OBJECT_ID(N'Users')
)
BEGIN
    CREATE UNIQUE INDEX UQ_Users_Active_Phone
    ON dbo.Users(phone)
    WHERE is_deleted = 0;
END;