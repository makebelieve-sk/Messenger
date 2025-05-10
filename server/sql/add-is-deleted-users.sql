-- Добавляем колонку is_deleted, если её нет
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'Users') AND name = N'is_deleted'
)
BEGIN
    ALTER TABLE Users ADD is_deleted BIT CONSTRAINT DF_Users_is_deleted DEFAULT (0);
END;