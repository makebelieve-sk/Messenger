import EventEmitter from "events";
import { v4 as uuid } from "uuid";
import { Request, Response, Express } from "express";
import { Op, Transaction } from "sequelize";
import { Literal, Where } from "sequelize/types/utils";

import { getSearchWhere } from "../utils/where";
import { LIMIT, LOAD_MORE_LIMIT } from "../utils/limits";
import { isImage } from "../utils/files";
import { ApiRoutes, ErrorTextsApi, HTTPStatuses, MessageReadStatus, MessageTypes } from "../types/enums";
import { ICall, IFile, IMessage, IUser } from "../types/models.types";
import { IChatInfo, IDialog } from "../types/chat.types";
import { UserPartial } from "../types/user.types";
import { ApiServerEvents } from "../types/events";
import { IImage } from "../types";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { MessagesError } from "../errors/controllers";

const SRC = process.env.CLIENT_URL as string;

interface IAttachmentFile extends IFile {
    firstName: string;
    thirdName: string;
    avatarUrl: string;
    originalSrc: string;
    createDate: string;
};

interface IConstructor {
    app: Express;
    middleware: Middleware;
    database: Database;
};

export default class MessagesController extends EventEmitter {
    private readonly _app: Express;
    private readonly _middleware: Middleware;
    private readonly _database: Database;

    constructor({ app, middleware, database }: IConstructor) {
        super();

        this._app = app;
        this._middleware = middleware;
        this._database = database;

        this._init();
    }

    // Слушатели запросов контроллера MessagesController
    private _init() {
        this._app.get(ApiRoutes.getMessageNotification, this._middleware.mustAuthenticated.bind(this._middleware), this._getMessageNotification.bind(this));
        this._app.post(ApiRoutes.getDialogs, this._middleware.mustAuthenticated.bind(this._middleware), this._getDialogs.bind(this));
        this._app.post(ApiRoutes.getMessages, this._middleware.mustAuthenticated.bind(this._middleware), this._getMessages.bind(this));
        this._app.post(ApiRoutes.saveMessage, this._middleware.mustAuthenticated.bind(this._middleware), this._saveMessage.bind(this));
        this._app.post(ApiRoutes.updateMessage, this._middleware.mustAuthenticated.bind(this._middleware), this._updateMessage.bind(this));
        this._app.post(ApiRoutes.readMessage, this._middleware.mustAuthenticated.bind(this._middleware), this._readMessage.bind(this));
        this._app.post(ApiRoutes.getChatId, this._middleware.mustAuthenticated.bind(this._middleware), this._getChatId.bind(this));
        this._app.post(ApiRoutes.getChatInfo, this._middleware.mustAuthenticated.bind(this._middleware), this._getChatInfo.bind(this));
        this._app.post(ApiRoutes.getUsersInChat, this._middleware.mustAuthenticated.bind(this._middleware), this._getUsersInChat.bind(this));
        this._app.post(ApiRoutes.getLastSeen, this._middleware.mustAuthenticated.bind(this._middleware), this._getLastSeen.bind(this));
        this._app.post(ApiRoutes.getChatSoundStatus, this._middleware.mustAuthenticated.bind(this._middleware), this._getChatSoundStatus.bind(this));
        this._app.post(ApiRoutes.setChatSoundStatus, this._middleware.mustAuthenticated.bind(this._middleware), this._setChatSoundStatus.bind(this));
        this._app.post(ApiRoutes.deleteMessage, this._middleware.mustAuthenticated.bind(this._middleware), this._deleteMessage.bind(this));
        this._app.post(ApiRoutes.deleteChat, this._middleware.mustAuthenticated.bind(this._middleware), this._deleteChat.bind(this));
        this._app.post(ApiRoutes.getAttachments, this._middleware.mustAuthenticated.bind(this._middleware), this._getAttachments.bind(this));
    }

    // Обработка ошибки
    private async _handleError(error: unknown, res: Response, transaction?: Transaction) {
        if (transaction) await transaction.rollback();

        this.emit(ApiServerEvents.ERROR, { error, res });
    }

    // Получаем количество непрочитанных сообщений в диалогах
    private async _getMessageNotification(req: Request, res: Response) {
        try {
            const userId = (req.user as IUser).id;

            // Невозможно сделать через include, так как идет LOIN Read_Messages.id (а мне нужно поле message_id)
            const unreadChatIds = await this._database.sequelize.query(`
                SELECT COUNT(ms.chat_id) as unReadChatsCount
                FROM Read_Messages as rm
                JOIN Messages as ms ON ms.id = rm.message_id
                WHERE rm.is_read = 0 and rm.user_id = '${userId}'
                GROUP BY ms.chat_id
            `) as [{ "unReadChatsCount": number }[], number];

            return res.json({ success: true, unreadChatIds: unreadChatIds[0] && unreadChatIds[0][0] ? unreadChatIds[0][0].unReadChatsCount : 0 });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Получить список всех диалогов
    private async _getDialogs(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { page, search, loadMore = false }: { page: number; search: string; loadMore: boolean; } = req.body;
            const userId = (req.user as IUser).id;

            const dialogsLimit = loadMore ? LOAD_MORE_LIMIT : LIMIT;

            // Получение обработанной строки поиска для поиска в имени и фамилии собеседника (только для приватных чатов)
            const searchValue = getSearchWhere(search) as string;

            // Находим все чаты с пользователем
            const chats = await this._database.sequelize.query(`
                WITH TOP_MESSAGES (chatId, id, message, type, createDate)
                AS (
                    SELECT chat_id AS chatId, Messages.id, message, type, create_date AS createDate
                    FROM Messages
                    JOIN Chats on Chats.id = Messages.chat_id
                    WHERE Messages.id IN (
                        SELECT TOP (1) msgs.id
                        FROM Messages AS msgs
                        WHERE msgs.chat_id = Chats.id
                        ORDER BY create_date DESC
                    )
                )
                SELECT DISTINCT Chats.[id], Chats.[name], Chats.[avatar_url] AS [avatarUrl], 
                    TopMessages.[id] AS messageId, TopMessages.[message], TopMessages.[type], TopMessages.[createDate]
                FROM [VK_CLONE].[dbo].[Chats] AS Chats
                JOIN [VK_CLONE].[dbo].[Users_in_chat] AS UsersInChat ON UsersInChat.chat_id = Chats.id
                JOIN [VK_CLONE].[dbo].[Users] AS Users ON Users.id = UsersInChat.user_id
                JOIN TOP_MESSAGES as TopMessages ON TopMessages.chatId = Chats.id
                WHERE NOT EXISTS (SELECT 1 FROM [Deleted_chats] AS [DeletedChats] WHERE [DeletedChats].[chat_id] = [Chats].id) AND
                (Users.id IN (
					SELECT U.id
					FROM [VK_CLONE].[dbo].[Users] AS U
					WHERE (LOWER(U.first_name) LIKE '%${searchValue}%' OR LOWER(U.third_name) LIKE '%${searchValue}%') AND U.id != '${userId}'
				) OR LOWER(Chats.name) LIKE '%${searchValue}%') AND
				UsersInChat.chat_id IN (
					SELECT UIC.chat_id
					FROM [VK_CLONE].[dbo].[Users_in_chat] AS UIC
					WHERE UIC.user_id = '${userId}'
				)
                ORDER BY TopMessages.[createDate] DESC
                OFFSET ${page * dialogsLimit} ROWS
                FETCH NEXT ${dialogsLimit + 1} ROWS ONLY;
            `);

            const updatedChats: IDialog[] = [];

            if (chats && chats[0].length) {
                for (let i = 0; i < chats[0].length; i++) {
                    const chat = chats[0][i] as never as any;
                    const chatObject = { id: chat.id, name: chat.name, avatarUrl: chat.avatarUrl } as IDialog;

                    // Получаем количество непрочитанных сообщений для диалога
                    const unReadMessages = await this._database.sequelize.query(
                        `
                            SELECT rm.message_id AS messageId
                            FROM [VK_CLONE].[dbo].[Read_messages] AS rm
                            JOIN Messages AS m ON m.id = rm.message_id
                            WHERE rm.is_read = 0 AND rm.user_id = '${userId}' AND m.chat_id = '${chat.id}'
                        `,
                        { transaction }
                    ) as [{ messageId: string; }[], number];

                    if (unReadMessages && unReadMessages[0]) {
                        chatObject.unReadMessageIds = unReadMessages[0].length
                            ? unReadMessages[0].map(unReadMessageId => unReadMessageId.messageId)
                            : [];
                    } else {
                        throw new MessagesError(ErrorTextsApi.NOT_CORRECT_ANSER_GET_DIALOGS);
                    }

                    // Получаем список пользователей для чата
                    const usersInChat = await this._database.models.users.findAll({
                        include: [{
                            model: this._database.models.usersInChat,
                            as: "UsersInChat",
                            attributes: ["user_id"],
                            where: { chatId: chat.id }
                        }],
                        attributes: ["id", "firstName", "thirdName", "avatarUrl"],
                        transaction
                    });

                    if (usersInChat && usersInChat.length) {
                        chatObject.usersInChat = usersInChat;
                    } else {
                        throw new MessagesError(`Пользователи в чате ${chat.name} не найдены`);
                    }

                    // Получаем статус звукового уведомления чата
                    const chatSoundStatus = await this._database.models.chatSoundNotifications.findOne({
                        where: { chatId: chat.id, userId },
                        attributes: ["id"],
                        transaction
                    }) as never as boolean;

                    if (chat.messageId) {
                        const { messageId, message, type, createDate } = chat;

                        let files: IFile[] = [];

                        const call = await this._database.models.calls.findByPk(messageId, {
                            attributes: ["id", "initiatorId"],
                            transaction
                        }) as ICall;

                        const user = await this._database.models.users.findByPk(messageId, {
                            attributes: ["id", "avatarUrl"],
                            transaction
                        }) as IUser;

                        const filesInMessage = await this._database.models.filesInMessage.findAll({
                            where: { messageId },
                            attributes: ["id", "fileId"],
                            transaction
                        });

                        if (filesInMessage && filesInMessage.length) {
                            const filesInstance = await this._database.models.files.findAll({
                                where: { id: { [Op.in]: filesInMessage.map(fileInMessage => fileInMessage.fileId) } },
                                attributes: ["id", "name"],
                                transaction
                            });

                            files = filesInstance.map(fileInstance => ({
                                id: fileInstance.id,
                                name: fileInstance.name
                            })) as never as IFile[];
                        }

                        // Формируем объект messageObject
                        chatObject.messageObject = {
                            createDate,
                            message,
                            type,
                            call,
                            files,
                            messageAuthor: user,
                            chatSoundStatus
                        };

                        updatedChats.push(chatObject);
                    }
                };
            }

            // Сортируем диалоги по времени последнего сообщения
            updatedChats.sort((a, b) =>
                new Date(b.messageObject.createDate).getTime() - new Date(a.messageObject.createDate).getTime()
            );

            const dialogs = updatedChats && updatedChats.length
                ? updatedChats.length > dialogsLimit
                    ? updatedChats.slice(0, dialogsLimit)
                    : updatedChats
                : [];
            const isMore = Boolean(updatedChats && updatedChats.length > dialogsLimit);

            await transaction.commit();

            return res.json({
                success: true,
                dialogs,
                isMore
            });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Получить список сообщений для одиночного/группового чата
    private async _getMessages(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { chatId, page, loadMore = false, search = "" }: { chatId: string; page: number; loadMore: boolean; search: string; } = req.body;
            const userId = (req.user as IUser).id;

            if (!chatId) {
                throw new MessagesError(ErrorTextsApi.CHAT_ID_NOT_FOUND);
            }

            const messagesLimit = loadMore ? LOAD_MORE_LIMIT : LIMIT;

            const where: (Where | Literal)[] = [
                this._database.sequelize.literal(`not exists (select 1 from [Deleted_messages] as [DeletedMessages] where [DeletedMessages].[message_id] = [Messages].id)`)
            ];

            // Получение обработанной строки поиска
            const prepearedSearch = getSearchWhere(search, "message", this._database.sequelize);

            if (prepearedSearch) {
                where.push(prepearedSearch as Where);
            }

            const moreMessages = await this._database.models.messages.findAll({
                where: { [Op.and]: where },
                order: [["create_date", "DESC"]],
                limit: messagesLimit + 1,
                offset: page * messagesLimit,
                include: [{
                    model: this._database.models.chats,
                    as: "Chat",
                    attributes: ["id"],
                    where: { id: chatId }
                }, {
                    model: this._database.models.users,
                    as: "User",
                    attributes: ["id", "firstName", "thirdName", "avatarUrl"]
                }, {
                    model: this._database.models.calls,
                    include: [{
                        model: this._database.models.usersInCall,
                        as: "UsersInCall"
                    }]
                }, {
                    model: this._database.models.deletedMessages,
                    as: "DeletedMessages",
                    attributes: ["id", "message_id"],
                    required: false
                }],
                transaction
            });

            const messages = moreMessages && moreMessages.length
                ? moreMessages.length > messagesLimit
                    ? moreMessages.slice(0, messagesLimit)
                    : moreMessages
                : [];
            const isMore = Boolean(moreMessages && moreMessages.length && moreMessages.length > LIMIT);

            let messagesWithMixins: IMessage[] = [];

            // Дополняем каждый объект сообщения статусом прочтенности и файлами (при наличии)
            if (messages && messages.length) {
                for (const message of messages) {
                    // Статус прочтенности
                    if (message.userId !== userId) {
                        const findReadMessage = await this._database.models.readMessages.findOne({
                            where: { messageId: message.id, userId },
                            transaction
                        });

                        if (findReadMessage) {
                            (message as any).dataValues.isRead = findReadMessage.isRead;
                        }
                    }

                    // Файлы
                    if ([MessageTypes.WITH_FILE, MessageTypes.FEW_FILES].includes(message.type)) {
                        const filesInMessage = await this._database.models.filesInMessage.findAll({
                            where: { messageId: message.id },
                            attributes: ["id", "fileId"],
                            transaction
                        });

                        if (filesInMessage && filesInMessage.length) {
                            const files = await this._database.models.files.findAll({
                                where: { id: { [Op.in]: filesInMessage.map(fileInMessage => fileInMessage.fileId) } },
                                transaction
                            });

                            (message as any).dataValues.files = files;
                        }
                    }

                    messagesWithMixins.push(message);
                }
            }

            await transaction.commit();

            return res.json({ success: true, messages: messagesWithMixins.reverse(), isMore });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Сохранить сообщение для одиночного чата
    private async _saveMessage(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { message, usersInChat, files }: { message: IMessage; usersInChat: UserPartial[]; files: string[]; } = req.body;
            const userId = (req.user as IUser).id;

            if (!message.userId) {
                throw new MessagesError(ErrorTextsApi.USER_ID_IN_MESSAGE_NOT_FOUND);
            }

            if (!message.chatId) {
                throw new MessagesError(ErrorTextsApi.CHAT_ID_IN_MESSAGE_NOT_FOUND);
            }

            if (!usersInChat || !usersInChat.length) {
                throw new MessagesError(`Пользователи в чате ${message.chatId} не найдены`);
            }

            // Сохраняем сообщение в таблицу Messages
            await this._database.models.messages.create({ ...message }, { transaction });

            // Сохраняем записи непрочитанных сообщений в таблицу Read_Messages
            const readMessages = usersInChat
                .filter(userInChat => userInChat.id !== userId)
                .map(userInChat => ({
                    id: uuid(),
                    userId: userInChat.id,
                    messageId: message.id,
                    isRead: message.isRead
                }));

            // При создании сообщения по умолчанию создаем запись в Read_messages в значении false
            await this._database.models.readMessages.bulkCreate(readMessages, { transaction });

            // Если в сообщении есть файлы, сохраняем в таблицу FilesInMessage
            if (files && files.length) {
                const filesInMessage = files.map(fileId => ({
                    id: uuid(),
                    messageId: message.id,
                    fileId
                }));

                await this._database.models.filesInMessage.bulkCreate(filesInMessage, { transaction });
            }

            await transaction.commit();

            return res.json({ success: true });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Изменение/редактирование сообщения
    private async _updateMessage(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { id, type, message, files }: { id: string; type: MessageTypes; message: IMessage; files: string[] | null; } = req.body;

            if (!id) {
                throw new MessagesError(ErrorTextsApi.MESSAGE_ID_NOT_FOUND);
            }

            if (!message && (!files || !files.length)) {
                throw new MessagesError(ErrorTextsApi.MESSAGE_CAN_NOT_BE_EMPTY_WITHOUT_FILES);
            }

            if (files && files.length) {
                // Удаляем ранее сохраненные файлы в этом сообщении
                await this._database.models.filesInMessage.destroy({
                    where: { messageId: id }
                });

                const filesInMessage = files.map(fileId => ({
                    id: uuid(),
                    messageId: id,
                    fileId
                }));
                
                // Сохраняем только что добавленные файлы в сообщение
                await this._database.models.filesInMessage.bulkCreate(filesInMessage, { transaction });
            }

            // Обновляем сообщение в таблице Messages
            await this._database.models.messages.update(
                { type, message },
                { where: { id } }
            );

            await transaction.commit();

            return res.json({ success: true });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Читаем сообщение (сообщения)
    private async _readMessage(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { ids }: { ids: string[]; } = req.body;
            const userId = (req.user as IUser).id;

            if (ids && ids.length) {
                await this._database.models.messages.update(
                    { isRead: MessageReadStatus.READ },
                    { where: { id: { [Op.in]: ids } }, transaction }
                );

                await this._database.models.readMessages.update(
                    { isRead: MessageReadStatus.READ },
                    { where: { messageId: { [Op.in]: ids }, userId }, transaction }
                );
            }

            await transaction.commit();

            return res.json({ success: true });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Получаем id чата
    private async _getChatId(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { friendId }: { friendId: string; } = req.body;
            const userId = (req.user as IUser).id;

            if (!friendId) {
                throw new MessagesError(ErrorTextsApi.CHAT_PARTNER_ID_NOT_FOUND);
            }

            let chatId: string | null = null;

            const myChats = await this._database.models.usersInChat.findAll({
                where: { userId },
                attributes: ["chat_id"],
                transaction
            });

            if (myChats && myChats.length) {
                const generalChats = await this._database.models.usersInChat.findAll({
                    where: {
                        userId: friendId,
                        chatId: {
                            [Op.in]: myChats.map(myChat => (myChat as any).dataValues.chat_id)
                        }
                    },
                    attributes: ["chat_id"],
                    transaction
                });

                if (generalChats && generalChats.length) {
                    for (let i = 0; i < generalChats.length; i++) {
                        const usersInChat = await this._database.models.usersInChat.findAll({
                            where: {
                                chatId: (generalChats[i] as any).dataValues.chat_id
                            },
                            attributes: ["user_id"],
                            transaction
                        });

                        if (usersInChat && usersInChat.length === 2) {
                            chatId = (generalChats[i] as any).dataValues.chat_id;
                            break;
                        }
                    }
                }
            }

            // Если чата не было, то создаем его и создаем пользователей в таблице UsersInChat
            if (!chatId) {
                chatId = uuid();

                await this._database.models.chats.create(
                    { id: chatId },
                    { transaction }
                );

                await this._database.models.usersInChat.create(
                    { id: uuid(), userId, chatId },
                    { transaction }
                );

                await this._database.models.usersInChat.create(
                    { id: uuid(), userId: friendId, chatId },
                    { transaction }
                );
            }

            await transaction.commit();

            return res.json({ success: true, chatId });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Получаем информацию о чате
    private async _getChatInfo(req: Request, res: Response) {
        try {
            const { chatId }: { chatId: string; } = req.body;

            if (!chatId) {
                throw new MessagesError(ErrorTextsApi.CHAT_ID_NOT_FOUND);
            }

            // Ищем чат в БД
            const chatInfo = await this._database.models.chats.findByPk(chatId, {
                attributes: [["id", "chatId"], ["name", "chatName"], ["avatar_url", "chatAvatar"]]
            }) as unknown as IChatInfo;

            // Если чата в БД нет, то возвращаем 404 статус
            if (!chatInfo) {
                throw new MessagesError(`Чат с идентификатором ${chatId} не найден`, HTTPStatuses.NotFound);
            }

            return res.json({ success: true, chatInfo });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Получаем пользователей чата
    private async _getUsersInChat(req: Request, res: Response) {
        try {
            const { chatId }: { chatId: string; } = req.body;

            if (!chatId) {
                throw new MessagesError(ErrorTextsApi.CHAT_ID_NOT_FOUND);
            }

            const usersInChat = await this._database.models.usersInChat.findAll({
                where: { chatId },
                include: [{
                    model: this._database.models.users,
                    attributes: ["id", "firstName", "thirdName", "avatarUrl"]
                }],
                attributes: []
            }) as unknown as { User: UserPartial }[];

            if (usersInChat && usersInChat.length) {
                return res.json({ success: true, usersInChat: usersInChat.map(userInChat => userInChat.User) });
            } else {
                throw new MessagesError(`Пользователи чата ${chatId} не найдены`, HTTPStatuses.NotFound);
            }
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Получаем последнее время онлайна собеседника чата
    private async _getLastSeen(req: Request, res: Response) {
        try {
            const { chatPartnerId }: { chatPartnerId: string; } = req.body;

            if (!chatPartnerId) {
                throw new MessagesError(ErrorTextsApi.CHAT_PARTNER_ID_NOT_FOUND);
            }

            const chatPartner = await this._database.models.userDetails.findOne({ 
                where: { userId: chatPartnerId },
                attributes: ["lastSeen"] 
            });

            if (!chatPartner) {
                throw new MessagesError(ErrorTextsApi.CHAT_PARTNER_NOT_FOUND, HTTPStatuses.NotFound);
            }

            return res.json({ success: true, lastSeen: chatPartner.lastSeen });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Получаем статус звукового уведомления чата
    private async _getChatSoundStatus(req: Request, res: Response) {
        try {
            const userId = (req.user as IUser).id;
            const { chatId }: { chatId: string; } = req.body;

            if (!chatId) {
                throw new MessagesError(ErrorTextsApi.CHAT_ID_NOT_FOUND);
            }

            const chatSoundStatus = await this._database.models.chatSoundNotifications.findOne({ 
                where: { chatId, userId },
                attributes: ["id"]
            });

            return res.json({ success: true, chatSoundStatus: Boolean(chatSoundStatus) });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Устанавливаем статус звукового уведомления чата
    private async _setChatSoundStatus(req: Request, res: Response) {
        try {
            const userId = (req.user as IUser).id;
            const { chatId, status }: { chatId: string; status: boolean; } = req.body;

            if (!chatId) {
                throw new MessagesError(ErrorTextsApi.CHAT_ID_NOT_FOUND);
            }

            // Удаляем запись из БД, если статус "Выключен" 
            // Иначе создаем запись в БД
            if (status) {
                await this._database.models.chatSoundNotifications.create({ 
                    id: uuid(),
                    chatId,
                    userId
                });
            } else {
                await this._database.models.chatSoundNotifications.destroy({
                    where: { chatId, userId }
                });
            }

            return res.json({ success: true });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Удалить сообщение из чата
    private async _deleteMessage(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const userId = (req.user as IUser).id;
            const { messageId, privateDelete }: { messageId: string; privateDelete: boolean; } = req.body;

            if (!messageId) {
                throw new MessagesError(ErrorTextsApi.DELETED_MESSAGE_ID_NOT_FOUND);
            }

            const findDeletedMessage = await this._database.models.deletedMessages.findOne({
                where: { messageId, userId },
                transaction
            });

            if (findDeletedMessage) {
                throw new MessagesError(ErrorTextsApi.YOUR_ALREADY_DELETE_THIS_MESSAGE);
            }

            if (privateDelete) {
                await this._database.models.messages.destroy({
                    where: { id: messageId },
                    transaction
                });

                await this._database.models.readMessages.destroy({
                    where: { messageId },
                    transaction
                });
            } else {
                await this._database.models.deletedMessages.create({
                    id: uuid(),
                    userId,
                    messageId
                }, { transaction });
            }

            await transaction.commit();

            return res.json({ success: true });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Удалить приватный чат (архивируем его в отдельную таблицу)
    private async _deleteChat(req: Request, res: Response) {
        try {
            const userId = (req.user as IUser).id;
            const { chatId }: { chatId: string; } = req.body;

            if (!chatId) {
                throw new MessagesError(ErrorTextsApi.DELETED_CHAT_ID_NOT_FOUND);
            }

            await this._database.models.deletedChats.create({
                id: uuid(),
                chatId,
                userId
            });

            return res.json({ success: true });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Получить вложения для чата
    private async _getAttachments(req: Request, res: Response) {
        try {
            const { chatId }: { chatId: string; } = req.body;

            if (!chatId) {
                throw new MessagesError(ErrorTextsApi.CHAT_ID_NOT_FOUND);
            }

            const attachments = await this._database.sequelize.query(`
                SELECT Files.*, Messages.create_date as createDate, Users.first_name as firstName, Users.third_name as thirdName, Users.avatar_url as avatarUrl
                FROM [VK_CLONE].[dbo].[Chats] AS Chats
                JOIN [VK_CLONE].[dbo].[Messages] AS Messages ON Messages.chat_id = Chats.id
                JOIN [VK_CLONE].[dbo].[Users] AS Users ON Users.id = Messages.user_id
                JOIN [VK_CLONE].[dbo].[Files_in_message] AS FilesInMessage ON Messages.id = FilesInMessage.message_id
                JOIN [VK_CLONE].[dbo].[Files] AS Files ON FilesInMessage.file_id = Files.id
                WHERE Chats.id = '${chatId}'
                ORDER BY Messages.create_date DESC, Files.name
            `) as [IAttachmentFile[], number];

            const images: IImage[] = [];
            const files: IAttachmentFile[] = [];

            for (let i = 0; i < attachments[0].length; i++) {
                const item = attachments[0][i];

                const isPhoto = isImage(item.name);

                if (isPhoto) {
                    // Формирование нового объекта картинки
                    const image = {
                        src: SRC + "/" + item.path.slice(7),
                        alt: item.name,
                        id: item.id,
                        authorName: item.firstName + " " + item.thirdName,
                        authorAvatarUrl: item.avatarUrl || "",
                        dateTime: item.createDate
                    };

                    images.push(image) 
                } else {
                    files.push({
                        ...item,
                        originalSrc: item.path,
                    });
                }
            }

            return res.json({ success: true, images, files });
        } catch (error) {
            this._handleError(error, res);
        }
    };
};