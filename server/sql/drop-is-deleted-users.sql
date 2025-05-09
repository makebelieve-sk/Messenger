-- Удаляем колонку is_deleted и её значение по умолчанию, если они были добавлены
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'Users') AND name = N'is_deleted'
)
BEGIN
    -- Удаляем ограничение по умолчанию
    IF EXISTS (
        SELECT 1
        FROM sys.default_constraints
        WHERE parent_object_id = OBJECT_ID(N'Users') AND name = 'DF_Users_is_deleted'
    )
    BEGIN
        ALTER TABLE dbo.Users DROP CONSTRAINT DF_Users_is_deleted;
    END

    -- Удаляем саму новую колонку
    ALTER TABLE dbo.Users DROP COLUMN is_deleted;
END;