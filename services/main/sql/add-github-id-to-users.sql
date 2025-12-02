-- Добавляем колонку github_id, если её нет
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'Users') AND name = N'github_id'
)
BEGIN
    ALTER TABLE Users
				ADD google_id  VARCHAR(255) NULL UNIQUE;
END;