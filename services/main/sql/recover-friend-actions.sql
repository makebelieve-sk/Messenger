-- Переименуем таблицу обратно в Friend_Actions_Log
IF OBJECT_ID('dbo.Friend_Actions', 'U') IS NOT NULL
BEGIN
    EXEC sp_rename 
        @objname = N'dbo.Friend_Actions', 
        @newname  = N'Friend_Actions_Log';
END;

-- Переименуем индексы обратно на Friend_Actions_Log
IF EXISTS (
    SELECT 1 
      FROM sys.indexes 
     WHERE name = 'IDX_Friend_Actions_SourceUserId'
       AND object_id = OBJECT_ID('dbo.Friend_Actions_Log')
)
BEGIN
    EXEC sp_rename 
        @objname = N'dbo.Friend_Actions_Log.IDX_Friend_Actions_SourceUserId', 
        @newname = N'IDX_Friend_Actions_Log_SourceUserId', 
        @objtype = N'INDEX';
END;

IF EXISTS (
    SELECT 1 
      FROM sys.indexes 
     WHERE name = 'IDX_Friend_Actions_TargetUserId'
       AND object_id = OBJECT_ID('dbo.Friend_Actions_Log')
)
BEGIN
    EXEC sp_rename 
        @objname = N'dbo.Friend_Actions_Log.IDX_Friend_Actions_TargetUserId', 
        @newname = N'IDX_Friend_Actions_Log_TargetUserId', 
        @objtype = N'INDEX';
END;

-- Переименуем внешние ключи обратно на Friend_Actions_Log
IF EXISTS (
    SELECT 1 
      FROM sys.foreign_keys 
     WHERE name = 'FK_Friend_Actions_Users_sourceUserId'
)
BEGIN
    EXEC sp_rename 
        @objname = N'dbo.FK_Friend_Actions_Users_sourceUserId', 
        @newname = N'FK_Friend_Actions_Log_Users_sourceUserId', 
        @objtype = N'OBJECT';
END;

IF EXISTS (
    SELECT 1 
      FROM sys.foreign_keys 
     WHERE name = 'FK_Friend_Actions_Users_targetUserId'
)
BEGIN
    EXEC sp_rename 
        @objname = N'dbo.FK_Friend_Actions_Users_targetUserId', 
        @newname = N'FK_Friend_Actions_Log_Users_targetUserId', 
        @objtype = N'OBJECT';
END;

-- Воссоздаём таблицу Friend_Actions (если её нет)
IF OBJECT_ID('dbo.Friend_Actions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Friend_Actions (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        source_user_id UNIQUEIDENTIFIER NOT NULL,
        target_user_id UNIQUEIDENTIFIER NOT NULL,
        action_type INT NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END;

-- Воссоздаём индексы на Friend_Actions
IF NOT EXISTS (
    SELECT 1 
      FROM sys.indexes 
     WHERE name = 'IDX_Friend_Actions_SourceUserId'
       AND object_id = OBJECT_ID('dbo.Friend_Actions')
)
BEGIN
    CREATE INDEX IDX_Friend_Actions_SourceUserId 
      ON dbo.Friend_Actions(source_user_id);
END;

IF NOT EXISTS (
    SELECT 1 
      FROM sys.indexes 
     WHERE name = 'IDX_Friend_Actions_TargetUserId'
       AND object_id = OBJECT_ID('dbo.Friend_Actions')
)
BEGIN
    CREATE INDEX IDX_Friend_Actions_TargetUserId 
      ON dbo.Friend_Actions(target_user_id);
END;

-- Воссоздаём внешние ключи на Friend_Actions
IF NOT EXISTS (
    SELECT 1 
      FROM sys.foreign_keys 
     WHERE name = 'FK_Friend_Actions_Users_sourceUserId'
)
BEGIN
    ALTER TABLE dbo.Friend_Actions
    ADD CONSTRAINT FK_Friend_Actions_Users_sourceUserId 
        FOREIGN KEY (source_user_id) 
        REFERENCES dbo.Users(id) 
        ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT 1 
      FROM sys.foreign_keys 
     WHERE name = 'FK_Friend_Actions_Users_targetUserId'
)
BEGIN
    ALTER TABLE dbo.Friend_Actions
    ADD CONSTRAINT FK_Friend_Actions_Users_targetUserId 
        FOREIGN KEY (target_user_id) 
        REFERENCES dbo.Users(id) 
        ON UPDATE NO ACTION 
        ON DELETE NO ACTION;
END;