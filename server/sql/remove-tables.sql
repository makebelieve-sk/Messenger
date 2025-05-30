-- Удаление всех начальных таблиц (их индексы удаляются автоматически, кроме исключения)
DROP TABLE IF EXISTS Files_in_Message;
DROP TABLE IF EXISTS Files;
DROP TABLE IF EXISTS Photos_in_Message;
DROP TABLE IF EXISTS User_Message_Statuses;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Users_in_Chat;
DROP TABLE IF EXISTS Disabled_Chats_Sound;
DROP TABLE IF EXISTS Chats;
DROP TABLE IF EXISTS Friend_Actions;
DROP TABLE IF EXISTS Notifications_Settings;
DROP TABLE IF EXISTS User_Photos;
DROP TABLE IF EXISTS User_Details;

-- Удаляем внешний ключ FK_Users_Photos_avatarId (если есть) - это как раз исключение
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Users_Photos_avatarId')
BEGIN
    ALTER TABLE Users DROP CONSTRAINT FK_Users_Photos_avatarId;
END;

DROP TABLE IF EXISTS Photos;
DROP TABLE IF EXISTS Users;