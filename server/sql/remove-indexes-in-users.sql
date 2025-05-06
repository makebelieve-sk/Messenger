-- Удаляем фильтрованные уникальные индексы
IF EXISTS (
    SELECT 1 
    FROM sys.indexes
    WHERE name = 'UQ_Users_Active_Email' AND object_id = OBJECT_ID(N'Users')
)
BEGIN
    DROP INDEX UQ_Users_Active_Email ON dbo.Users;
END;

IF EXISTS (
    SELECT 1 
    FROM sys.indexes
    WHERE name = 'UQ_Users_Active_Phone' AND object_id = OBJECT_ID(N'Users')
)
BEGIN
    DROP INDEX UQ_Users_Active_Phone ON dbo.Users;
END;

-- Восстанавливаем оригинальные UNIQUE-ограничения
IF NOT EXISTS (
    SELECT 1 
    FROM sys.key_constraints
    WHERE name = 'UQ_Users_Email' AND parent_object_id = OBJECT_ID(N'Users')
)
BEGIN
    ALTER TABLE dbo.Users
    ADD CONSTRAINT UQ_Users_Email UNIQUE (email);
END;

IF NOT EXISTS (
    SELECT 1 
    FROM sys.key_constraints
    WHERE name = 'UQ_Users_Phone' AND parent_object_id = OBJECT_ID(N'Users')
)
BEGIN
    ALTER TABLE dbo.Users
    ADD CONSTRAINT UQ_Users_Phone UNIQUE (phone);
END;

-- Восстанавливаем обычные индексы
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes
    WHERE name = 'IDX_Users_Email' AND object_id = OBJECT_ID(N'Users')
)
BEGIN
    CREATE INDEX IDX_Users_Email ON dbo.Users(email);
END;

IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes
    WHERE name = 'IDX_Users_Phone' AND object_id = OBJECT_ID(N'Users')
)
BEGIN
    CREATE INDEX IDX_Users_Phone ON dbo.Users(phone);
END;