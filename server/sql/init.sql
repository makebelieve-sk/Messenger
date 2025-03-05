-- Создаем список начальных таблиц (все остальные изменения, связанные с SQL, будут в папке migrations)

-- Создаем таблицу Users без avatar_id
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        first_name NVARCHAR(100) NOT NULL,
        second_name NVARCHAR(100) NULL,
        third_name NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        phone NVARCHAR(20) NOT NULL,
        password NVARCHAR(255) NOT NULL,
        salt NVARCHAR(255) NOT NULL,

        CONSTRAINT UQ_Users_Email UNIQUE (email),
        CONSTRAINT UQ_Users_Phone UNIQUE (phone),
        CONSTRAINT CHK_Users_Phone CHECK (phone LIKE '+[1-9][0-9]%' AND LEN(phone) BETWEEN 11 AND 15)
    );

    CREATE INDEX IDX_Users_Email ON Users(email);
    CREATE INDEX IDX_Users_Phone ON Users(phone);
END;

-- Создаем таблицу Photos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Photos')
BEGIN
    CREATE TABLE Photos (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        user_id UNIQUEIDENTIFIER NOT NULL,
        path NVARCHAR(255) NOT NULL,
        size BIGINT NOT NULL CHECK (size > 0),
        extension NVARCHAR(50) NOT NULL CHECK (extension IN ('jpg', 'png', 'gif', 'bmp', 'webp')),
        created_at DATETIME2(3) DEFAULT SYSDATETIME(),

        CONSTRAINT FK_Photos_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IDX_Photos_UserId ON Photos(user_id);
END;

-- Добавляем avatar_id в Users (только после создания Photos)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'avatar_id' AND object_id = OBJECT_ID('Users'))
BEGIN
    ALTER TABLE Users ADD avatar_id UNIQUEIDENTIFIER NULL;
    ALTER TABLE Users ADD CONSTRAINT FK_Users_Photos_avatarId FOREIGN KEY (avatar_id) REFERENCES Photos(id) ON UPDATE NO ACTION ON DELETE NO ACTION;
END;

-- Создаем таблицу User_Details
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'User_Details')
BEGIN
    CREATE TABLE User_Details (
        user_id UNIQUEIDENTIFIER PRIMARY KEY,
        birthday DATE NULL,
        city NVARCHAR(255) NULL,
        work NVARCHAR(255) NULL,
        sex NVARCHAR(10) NULL CHECK (sex IN ('male', 'female')),
        last_seen DATETIME2(3) NULL,

        CONSTRAINT FK_User_Details_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IDX_User_Details_UserId ON User_Details(user_id);
END;

-- Создаем таблицу User_Photos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'User_Photos')
BEGIN
    CREATE TABLE User_Photos (
        photo_id UNIQUEIDENTIFIER,
        user_id UNIQUEIDENTIFIER,

        PRIMARY KEY (photo_id, user_id),
        CONSTRAINT FK_User_Photos_Photos FOREIGN KEY (photo_id) REFERENCES Photos(id) ON DELETE CASCADE,
        CONSTRAINT FK_User_Photos_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON UPDATE NO ACTION ON DELETE NO ACTION
    );

    CREATE INDEX IDX_User_Photos_PhotoId ON User_Photos(photo_id);
    CREATE INDEX IDX_User_Photos_UserId ON User_Photos(user_id);
END;

-- Создаем таблицу Notification_Settings
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notification_Settings')
BEGIN
    CREATE TABLE Notification_Settings (
        user_id UNIQUEIDENTIFIER PRIMARY KEY,
        sound_enabled BIT NOT NULL DEFAULT 1,
        message_sound BIT NOT NULL DEFAULT 1,
        friend_request_sound BIT NOT NULL DEFAULT 1,

        CONSTRAINT FK_Notification_Settings_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IDX_Notification_Settings_UserId ON Notification_Settings(user_id);
END;

-- Создаем таблицу Friend_Actions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Friend_Actions')
BEGIN
    CREATE TABLE Friend_Actions (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        source_user_id UNIQUEIDENTIFIER NOT NULL,
        target_user_id UNIQUEIDENTIFIER NOT NULL,
        action_type INT NOT NULL,

        CONSTRAINT FK_Friend_Actions_Users_sourceUserId FOREIGN KEY (source_user_id) REFERENCES Users(id) ON DELETE CASCADE,
        CONSTRAINT FK_Friend_Actions_Users_targetUserId FOREIGN KEY (target_user_id) REFERENCES Users(id) ON UPDATE NO ACTION ON DELETE NO ACTION
    );

    CREATE INDEX IDX_Friend_Actions_SourceUserId ON Friend_Actions(source_user_id);
    CREATE INDEX IDX_Friend_Actions_TargetUserId ON Friend_Actions(target_user_id);
END;

-- Создаем таблицу Friend_Actions_Log
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Friend_Actions_Log')
BEGIN
    CREATE TABLE Friend_Actions_Log (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        source_user_id UNIQUEIDENTIFIER NOT NULL,
        target_user_id UNIQUEIDENTIFIER NOT NULL,
        action_type INT NOT NULL,
        created_at DATETIME2(3) DEFAULT SYSDATETIME(),

        CONSTRAINT FK_Friend_Actions_Log_Users_sourceUserId FOREIGN KEY (source_user_id) REFERENCES Users(id) ON DELETE CASCADE,
        CONSTRAINT FK_Friend_Actions_Log_Users_targetUserId FOREIGN KEY (target_user_id) REFERENCES Users(id) ON UPDATE NO ACTION ON DELETE NO ACTION
    );

    CREATE INDEX IDX_Friend_Actions_Log_SourceUserId ON Friend_Actions_Log(source_user_id);
    CREATE INDEX IDX_Friend_Actions_Log_TargetUserId ON Friend_Actions_Log(target_user_id);
END;

-- Создаем таблицу Chats с avatar_id
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Chats')
BEGIN
    CREATE TABLE Chats (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        avatar_id UNIQUEIDENTIFIER NULL,
        name NVARCHAR(255) NOT NULL,

        CONSTRAINT FK_Chats_Photos_avatarId FOREIGN KEY (avatar_id) REFERENCES Photos(id) ON DELETE SET NULL
    );

    CREATE INDEX IDX_Chats_Name ON Chats(name);
END;

-- Создаем таблицу Disabled_Chat_Sound
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Disabled_Chat_Sound')
BEGIN
    CREATE TABLE Disabled_Chat_Sound (
        user_id UNIQUEIDENTIFIER,
        chat_id UNIQUEIDENTIFIER,

        PRIMARY KEY (user_id, chat_id),
        CONSTRAINT FK_Disabled_Chat_Sound_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        CONSTRAINT FK_Disabled_Chat_Sound_Chats FOREIGN KEY (chat_id) REFERENCES Chats(id) ON DELETE CASCADE
    );

    CREATE INDEX IDX_Disabled_Chat_Sound_UserId ON Disabled_Chat_Sound(user_id);
    CREATE INDEX IDX_Disabled_Chat_Sound_ChatId ON Disabled_Chat_Sound(chat_id);
END;

-- Создаем таблицу Users_in_Chat
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users_in_Chat')
BEGIN
    CREATE TABLE Users_in_Chat (
        chat_id UNIQUEIDENTIFIER,
        user_id UNIQUEIDENTIFIER,

        PRIMARY KEY (chat_id, user_id),
        CONSTRAINT FK_Users_in_Chat_Chats FOREIGN KEY (chat_id) REFERENCES Chats(id) ON DELETE CASCADE,
        CONSTRAINT FK_Users_in_Chat_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IDX_Users_in_Chat_ChatId ON Users_in_Chat(chat_id);
    CREATE INDEX IDX_Users_in_Chat_UserId ON Users_in_Chat(user_id);
END;

-- Создаем таблицу Messages
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Messages')
BEGIN
    CREATE TABLE Messages (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        chat_id UNIQUEIDENTIFIER NOT NULL,
        user_id UNIQUEIDENTIFIER NOT NULL,
        type INT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME2(3) DEFAULT SYSDATETIME(),

        CONSTRAINT FK_Messages_Chats FOREIGN KEY (chat_id) REFERENCES Chats(id) ON DELETE CASCADE,
        CONSTRAINT FK_Messages_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION
    );

    CREATE INDEX IDX_Messages_ChatId ON Messages(chat_id);
    CREATE INDEX IDX_Messages_UserId ON Messages(user_id);
END;

-- Создаем таблицу User_Message_Statuses
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'User_Message_Statuses')
BEGIN
    CREATE TABLE User_Message_Statuses (
        message_id UNIQUEIDENTIFIER,
        user_id UNIQUEIDENTIFIER,
        is_read BIT DEFAULT 0,
        is_deleted BIT DEFAULT 0,

        PRIMARY KEY (message_id, user_id),
        CONSTRAINT FK_User_Message_Statuses_Messages FOREIGN KEY (message_id) REFERENCES Messages(id) ON DELETE CASCADE,
        CONSTRAINT FK_User_Message_Statuses_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION
    );

    CREATE INDEX IDX_User_Message_Statuses_MessageId ON User_Message_Statuses(message_id);
    CREATE INDEX IDX_User_Message_Statuses_UserId ON User_Message_Statuses(user_id);
END;

-- Создаем таблицу Photos_in_Message
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Photos_in_Message')
BEGIN
    CREATE TABLE Photos_in_Message (
        photo_id UNIQUEIDENTIFIER,
        message_id UNIQUEIDENTIFIER,

        PRIMARY KEY (photo_id, message_id),
        CONSTRAINT FK_Photos_in_Message_Photos FOREIGN KEY (photo_id) REFERENCES Photos(id) ON DELETE CASCADE,
        CONSTRAINT FK_Photos_in_Message_Messages FOREIGN KEY (message_id) REFERENCES Messages(id) ON DELETE CASCADE
    );

    CREATE INDEX IDX_Photos_in_Message_PhotoId ON Photos_in_Message(photo_id);
    CREATE INDEX IDX_Photos_in_Message_MessageId ON Photos_in_Message(message_id);
END;

-- Создаем таблицу Files
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Files')
BEGIN
    CREATE TABLE Files (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        user_id UNIQUEIDENTIFIER NOT NULL,
        path NVARCHAR(255) NOT NULL,
        size BIGINT NOT NULL CHECK (size > 0),
        extension NVARCHAR(50) NOT NULL,
        created_at DATETIME2(3) DEFAULT SYSDATETIME(),

        CONSTRAINT FK_Files_Users FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION
    );

    CREATE INDEX IDX_Files_UserId ON Files(user_id);
END;

-- Создаем таблицу Files_in_Message
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Files_in_Message')
BEGIN
    CREATE TABLE Files_in_Message (
        file_id UNIQUEIDENTIFIER,
        message_id UNIQUEIDENTIFIER,

        PRIMARY KEY (file_id, message_id),
        CONSTRAINT FK_Files_in_Message_Files FOREIGN KEY (file_id) REFERENCES Files(id) ON DELETE CASCADE,
        CONSTRAINT FK_Files_in_Message_Messages FOREIGN KEY (message_id) REFERENCES Messages(id) ON DELETE CASCADE
    );

    CREATE INDEX IDX_Files_in_Message_FileId ON Files_in_Message(file_id);
    CREATE INDEX IDX_Files_in_Message_MessageId ON Files_in_Message(message_id);
END;