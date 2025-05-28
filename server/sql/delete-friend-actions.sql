-- Выполняем миграцию только если существует таблица Friend_Actions_Log
IF OBJECT_ID('dbo.Friend_Actions_Log', 'U') IS NOT NULL
BEGIN
  -- Удаляем внешние ключи
  IF EXISTS (
      SELECT 1 
        FROM sys.foreign_keys 
      WHERE name = 'FK_Friend_Actions_Users_sourceUserId'
  )
  BEGIN
      ALTER TABLE dbo.Friend_Actions
      DROP CONSTRAINT FK_Friend_Actions_Users_sourceUserId;
  END;

  IF EXISTS (
      SELECT 1 
        FROM sys.foreign_keys 
      WHERE name = 'FK_Friend_Actions_Users_targetUserId'
  )
  BEGIN
      ALTER TABLE dbo.Friend_Actions
      DROP CONSTRAINT FK_Friend_Actions_Users_targetUserId;
  END;

  -- Удаляем индексы
  IF EXISTS (
      SELECT 1 
        FROM sys.indexes 
      WHERE name = 'IDX_Friend_Actions_SourceUserId'
        AND object_id = OBJECT_ID('dbo.Friend_Actions')
  )
  BEGIN
      DROP INDEX IDX_Friend_Actions_SourceUserId 
        ON dbo.Friend_Actions;
  END;

  IF EXISTS (
      SELECT 1 
        FROM sys.indexes 
      WHERE name = 'IDX_Friend_Actions_TargetUserId'
        AND object_id = OBJECT_ID('dbo.Friend_Actions')
  )
  BEGIN
      DROP INDEX IDX_Friend_Actions_TargetUserId 
        ON dbo.Friend_Actions;
  END;

  -- Удаляем саму таблицу
  IF OBJECT_ID('dbo.Friend_Actions', 'U') IS NOT NULL
  BEGIN
      DROP TABLE dbo.Friend_Actions;
  END;

  -- Переименовываем таблицу логов
  IF OBJECT_ID('dbo.Friend_Actions_Log', 'U') IS NOT NULL
  BEGIN
      EXEC sp_rename 
          @objname = N'dbo.Friend_Actions_Log', 
          @newname  = N'Friend_Actions';
  END;

  -- Переименовываем индексы на новой таблице
  IF EXISTS (
      SELECT 1 
        FROM sys.indexes 
      WHERE name = 'IDX_Friend_Actions_Log_SourceUserId'
        AND object_id = OBJECT_ID('dbo.Friend_Actions')
  )
  BEGIN
      EXEC sp_rename 
          @objname = N'dbo.Friend_Actions.IDX_Friend_Actions_Log_SourceUserId', 
          @newname = N'IDX_Friend_Actions_SourceUserId', 
          @objtype = N'INDEX';
  END;

  IF EXISTS (
      SELECT 1 
        FROM sys.indexes 
      WHERE name = 'IDX_Friend_Actions_Log_TargetUserId'
        AND object_id = OBJECT_ID('dbo.Friend_Actions')
  )
  BEGIN
      EXEC sp_rename 
          @objname = N'dbo.Friend_Actions.IDX_Friend_Actions_Log_TargetUserId', 
          @newname = N'IDX_Friend_Actions_TargetUserId', 
          @objtype = N'INDEX';
  END;

  -- Переименовываем внешние ключи на новой таблице
  IF EXISTS (
      SELECT 1 
        FROM sys.foreign_keys 
      WHERE name = 'FK_Friend_Actions_Log_Users_sourceUserId'
  )
  BEGIN
      EXEC sp_rename 
          @objname = N'dbo.FK_Friend_Actions_Log_Users_sourceUserId', 
          @newname = N'FK_Friend_Actions_Users_sourceUserId', 
          @objtype = N'OBJECT';
  END;

  IF EXISTS (
      SELECT 1 
        FROM sys.foreign_keys 
      WHERE name = 'FK_Friend_Actions_Log_Users_targetUserId'
  )
  BEGIN
      EXEC sp_rename 
          @objname = N'dbo.FK_Friend_Actions_Log_Users_targetUserId', 
          @newname = N'FK_Friend_Actions_Users_targetUserId', 
          @objtype = N'OBJECT';
  END;
END;