import { v4 as uuid } from "uuid";
import { Request, Response, Express, NextFunction } from "express";
import { Transaction } from "sequelize";

import { getSearchWhere } from "../utils/where";
import { ApiRoutes, ErrorTextsApi, FriendsTab } from "../types/enums";
import { ISafeUser } from "../types/user.types";
import { UsersType } from "../types";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { FriendsError } from "../errors/controllers";

// Класс, отвечающий за API друзей
export default class FriendsController {
    constructor(private readonly _app: Express, private readonly _middleware: Middleware, private readonly _database: Database, private readonly _users: UsersType) {
        this._init();
    }

    // Слушатели запросов контроллера FriendsController
    private _init() {
        this._app.get(ApiRoutes.getFriendsNotification, this._middleware.mustAuthenticated.bind(this._middleware), this._getFriendsNotification.bind(this));
        this._app.get(ApiRoutes.getPossibleUsers, this._middleware.mustAuthenticated.bind(this._middleware), this._getPossibleUsers.bind(this));
        this._app.get(ApiRoutes.getCountFriends, this._middleware.mustAuthenticated.bind(this._middleware), this._getCountFriends.bind(this));
        this._app.post(ApiRoutes.getFriends, this._middleware.mustAuthenticated.bind(this._middleware), this._getFriends.bind(this));
        this._app.post(ApiRoutes.getFriendInfo, this._middleware.mustAuthenticated.bind(this._middleware), this._getFriendInfo.bind(this));
        this._app.post(ApiRoutes.addToFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._addToFriend.bind(this));
        this._app.post(ApiRoutes.unsubscribeUser, this._middleware.mustAuthenticated.bind(this._middleware), this._unsubscribeUser.bind(this));
        this._app.post(ApiRoutes.acceptUser, this._middleware.mustAuthenticated.bind(this._middleware), (req, res, next) => this._acceptUser(req, res, next, undefined));
        this._app.post(ApiRoutes.leftInSubscribers, this._middleware.mustAuthenticated.bind(this._middleware), this._leftInSubscribers.bind(this));
        this._app.post(ApiRoutes.deleteFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._deleteFriend.bind(this));
        this._app.post(ApiRoutes.blockFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._blockFriend.bind(this));
        this._app.post(ApiRoutes.checkBlockStatus, this._middleware.mustAuthenticated.bind(this._middleware), this._checkBlockStatus.bind(this));
    }

    // Получение возможных друзей
    private _possibleUsersQuery(userId: string, all: boolean = false, searchValue = "") {
        return `
            SELECT ${all ? "" : "TOP (5)"} users.[id], [first_name] AS [firstName], [second_name] AS [secondName], [third_name] AS [thirdName], [email], [phone], [avatar_url] AS [avatarUrl]
            FROM [VK_CLONE].[dbo].[Users] AS users
            LEFT JOIN [VK_CLONE].[dbo].[Friends] AS friends ON friends.user_id = users.id
            LEFT JOIN [VK_CLONE].[dbo].[Subscribers] AS subscribers ON subscribers.user_id = users.id
            WHERE users.id != '${userId}' AND users.id NOT IN (
                SELECT friend_id
                FROM [VK_CLONE].[dbo].[Friends] AS friendsIn
                WHERE friendsIn.user_id = '${userId}'
            ) AND users.id NOT IN (
                SELECT user_id
                FROM [VK_CLONE].[dbo].[Subscribers] AS subscribersIn
                WHERE subscribers.subscriber_id = '${userId}'
            ) AND users.id NOT IN (
                SELECT user_blocked
                FROM [VK_CLONE].[dbo].[Block_users] AS blockUsers
                WHERE blockUsers.user_id = '${userId}'
            ) ${searchValue}
        `;
    };

    // Получение запросов на дружбу
    private _getFreindsRequestsQuery(userId: string, searchQuery: string = "") {
        return `
            SELECT users.[id], [first_name] AS [firstName], [second_name] AS [secondName], [third_name] AS [thirdName], [email], [phone], [avatar_url] AS [avatarUrl]
            FROM [VK_CLONE].[dbo].[Users] AS users
            JOIN [VK_CLONE].[dbo].[Subscribers] AS subscribers ON subscribers.subscriber_id = users.id
            WHERE users.id != '${userId}' AND users.id IN (
                SELECT subscriber_id
                FROM [VK_CLONE].[dbo].[Subscribers] AS subscribersIn
                WHERE subscribersIn.user_id = '${userId}' AND left_in_subs = 0
            ) ${searchQuery}
        `;
    };

    // Получить количество заявок в друзья для отрисовки в меню
    private async _getFriendsNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as ISafeUser).id;
            const friends = await this._database.sequelize.query(this._getFreindsRequestsQuery(userId));

            if (friends && friends[0]) {
                res.json({ success: true, friendRequests: friends[0].length });
            } else {
                return next(new FriendsError(ErrorTextsApi.NOT_CORRECT_ANSER_GET_FRIENDS_NOTIFICATIONS));
            }
        } catch (error) {
            next(error);
        }
    };

    // Получение топ-5 возможных друзей
    private async _getPossibleUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as ISafeUser).id;

            const possibleUsers = await this._database.sequelize.query(this._possibleUsersQuery(userId));

            if (possibleUsers && possibleUsers[0]) {
                res.json({ success: true, possibleUsers: possibleUsers[0] });
            } else {
                return next(new FriendsError(ErrorTextsApi.NOT_CORRECT_ANSER_POSSIBLE_USERS));
            }
        } catch (error) {
            next(error);
        }
    };

    // Получить количество друзей, подписчиков, топ-6 друзей для отрисовки
    private async _getCountFriends(req: Request, res: Response, next: NextFunction) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const userId = (req.user as ISafeUser).id;

            const friendsCount: [any[], any] = await this._database.sequelize.query(`
                SELECT COUNT(*) AS count
                FROM [VK_CLONE].[dbo].[Users] AS users
                JOIN [VK_CLONE].[dbo].[Friends] AS friends ON friends.user_id = users.id
                WHERE users.id != '${userId}' AND users.id IN (
                    SELECT friend_id
                    FROM [VK_CLONE].[dbo].[Friends] AS friendsIn
                    WHERE friendsIn.user_id = '${userId}'
                )
            `, { transaction });

            const topFriends = await this._database.sequelize.query(`
                SELECT DISTINCT TOP(6) users.[id], [first_name] AS [firstName], [second_name] AS [secondName], [third_name] AS [thirdName], [email], [phone], [avatar_url] as avatarUrl
                FROM [VK_CLONE].[dbo].[Users] AS users
                JOIN [VK_CLONE].[dbo].[Friends] AS friends ON friends.user_id = users.id
                WHERE users.id != '${userId}' AND users.id IN (
                    SELECT friend_id
                    FROM [VK_CLONE].[dbo].[Friends] AS friendsIn
                    WHERE friendsIn.user_id = '${userId}'
                )
            `, { transaction });

            const subscribersCount: [any[], any] = await this._database.sequelize.query(`
                SELECT COUNT(*) AS count
                FROM [VK_CLONE].[dbo].[Users] AS users
                JOIN [VK_CLONE].[dbo].[Subscribers] AS subscribers ON subscribers.subscriber_id = users.id
                WHERE users.id != '${userId}' AND users.id IN (
                    SELECT subscriber_id
                    FROM [VK_CLONE].[dbo].[Subscribers] AS subscribersIn
                    WHERE subscribersIn.user_id = '${userId}' AND left_in_subs = 1
                )
            `, { transaction });

            await transaction.commit();

            res.json({ 
                success: true, 
                friendsCount: friendsCount && friendsCount[0] ? topFriends[0].length : null, 
                topFriends: topFriends && topFriends[0] ? topFriends[0] : null, 
                subscribersCount: subscribersCount && subscribersCount[0] ? subscribersCount[0][0].count : null
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Получение 5 возможных друзей, всех друзей и друзей онлайн
    private async _getFriends(req: Request, res: Response, next: NextFunction) {
        try {
            const { tab = 0, search }: { tab: number; search: string; } = req.body;
            const userId = (req.user as ISafeUser).id;

            // Получение обработанной строки поиска
            const searchValue = getSearchWhere(search) as string;

            const searchQuery = searchValue
                ? `AND (LOWER(users.first_name) LIKE '%${searchValue}%' OR LOWER(users.third_name) LIKE '%${searchValue}%')`
                : "";

            switch (tab) {
                // Получение всех друзей
                case FriendsTab.all: {
                    const friends = await this._database.sequelize.query(`
                        SELECT DISTINCT users.[id], [first_name] AS [firstName], [second_name] AS [secondName], [third_name] AS [thirdName], [email], [phone], [avatar_url] as avatarUrl
                        FROM [VK_CLONE].[dbo].[Users] AS users
                        JOIN [VK_CLONE].[dbo].[Friends] AS friends ON friends.user_id = users.id
                        WHERE users.id != '${userId}' AND users.id IN (
                            SELECT friend_id
                            FROM [VK_CLONE].[dbo].[Friends] AS friendsIn
                            WHERE friendsIn.user_id = '${userId}'
                        ) ${searchQuery}
                    `);

                    if (friends && friends[0]) {
                        return res.json({ success: true, friends: friends[0] });
                    } else {
                        return next(new FriendsError(ErrorTextsApi.NOT_CORRECT_ANSER_GET_FRIENDS_TAB_0));
                    }
                }
                // Получение друзей-онлайн
                case FriendsTab.online: {
                    if (this._users.size) {
                        const usersOnline = Array.from(this._users.values());

                        const filterUsersOnline = usersOnline.filter(onlineUser => {
                            const searchFN = onlineUser.firstName.toLowerCase();
                            const searchTN = onlineUser.thirdName.toLowerCase();

                            if (onlineUser.id !== userId) {
                                if (searchValue && (searchFN.includes(searchValue) || searchTN.includes(searchValue))) {
                                    return true;
                                } else if (searchValue && !searchFN.includes(searchValue) && !searchTN.includes(searchValue)) {
                                    return false;
                                }

                                return true;
                            }

                            return false;
                        });

                        return res.json({ success: true, friends: filterUsersOnline });
                    } else {
                        return next(new FriendsError(ErrorTextsApi.NOT_CORRECT_ANSER_GET_FRIENDS_TAB_1));
                    }
                }
                // Получение подписчиков
                case FriendsTab.subscribers: {
                    const friends = await this._database.sequelize.query(`
                        SELECT users.[id], [first_name] AS [firstName], [second_name] AS [secondName], [third_name] AS [thirdName], [email], [phone], [avatar_url] as avatarUrl
                        FROM [VK_CLONE].[dbo].[Users] AS users
                        JOIN [VK_CLONE].[dbo].[Subscribers] AS subscribers ON subscribers.subscriber_id = users.id
                        WHERE users.id != '${userId}' AND users.id IN (
                            SELECT subscriber_id
                            FROM [VK_CLONE].[dbo].[Subscribers] AS subscribersIn
                            WHERE subscribersIn.user_id = '${userId}' AND left_in_subs = 1
                        ) ${searchQuery}
                    `);

                    if (friends && friends[0]) {
                        return res.json({ success: true, friends: friends[0] });
                    } else {
                        return next(new FriendsError(ErrorTextsApi.NOT_CORRECT_ANSER_GET_FRIENDS_TAB_2));
                    }
                }
                // Получение входящих заявок
                case FriendsTab.friendRequests: {
                    const friends = await this._database.sequelize.query(this._getFreindsRequestsQuery(userId, searchQuery));

                    if (friends && friends[0]) {
                        return res.json({ success: true, friends: friends[0] });
                    } else {
                        return next(new FriendsError(ErrorTextsApi.NOT_CORRECT_ANSER_GET_FRIENDS_TAB_3));
                    }
                }
                // Получение исходящих заявок
                case FriendsTab.incomingRequests: {
                    const friends = await this._database.sequelize.query(`
                        SELECT users.[id], [first_name] AS [firstName], [second_name] AS [secondName], [third_name] AS [thirdName], [email], [phone], [avatar_url] as avatarUrl
                        FROM [VK_CLONE].[dbo].[Users] AS users
                        JOIN [VK_CLONE].[dbo].[Subscribers] AS subscribers ON subscribers.user_id = users.id
                        WHERE users.id != '${userId}' AND users.id IN (
                            SELECT user_id
                            FROM [VK_CLONE].[dbo].[Subscribers] AS subscribersIn
                            WHERE subscribersIn.subscriber_id = '${userId}'
                        ) ${searchQuery}
                    `);

                    if (friends && friends[0]) {
                        return res.json({ success: true, friends: friends[0] });
                    } else {
                        return next(new FriendsError(ErrorTextsApi.NOT_CORRECT_ANSER_GET_FRIENDS_TAB_4));
                    }
                }
                // Поиск друзей
                case FriendsTab.search: {
                    const friends = await this._database.sequelize.query(this._possibleUsersQuery(userId, true, searchQuery));

                    if (friends && friends[0]) {
                        return res.json({ success: true, friends: friends[0] });
                    } else {
                        return next(new FriendsError(ErrorTextsApi.NOT_CORRECT_ANSER_GET_FRIENDS_TAB_5));
                    }
                }
                default:
                    return next(new FriendsError(ErrorTextsApi.UNKNOWN_TAB));
            };
        } catch (error) {
            next(error);
        }
    };

    // Получить специфичную информацию о друге, с которым открыт диалог
    private async _getFriendInfo(req: Request, res: Response, next: NextFunction) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { chatId }: { chatId: string; } = req.body;
            const userId = (req.user as ISafeUser).id;

            if (!chatId) {
                return next(new FriendsError(ErrorTextsApi.CHAT_ID_NOT_FOUND));
            }

            const userIdsInChat: any = await this._database.models.chats.findOne({ 
                where: { id: chatId }, 
                attributes: ["userIds"],
                transaction
            });

            let friendId: string | null = null;

            if (userIdsInChat) {
                const ids = userIdsInChat.userIds.split(",");
                const findFriendId = ids.find((id: string) => id !== userId);

                if (findFriendId) {
                    friendId = findFriendId;
                }
            }

            const friendInfo = friendId 
                ? await this._database.models.users.findByPk(friendId, { 
                    attributes: ["id", "avatarUrl", "firstName", "thirdName"],
                    transaction
                })
                : null;

            if (!friendInfo) {
                return next(new FriendsError(ErrorTextsApi.NOT_TEMPORAL_CHAT_ID));
            }

            await transaction.commit();

            res.json({ 
                success: true, 
                friendInfo: { 
                    id: friendInfo.id, 
                    avatarUrl: friendInfo.avatarUrl, 
                    friendName: friendInfo.firstName + " " + friendInfo.thirdName 
                } 
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Добавить пользователя в друзья
    private async _addToFriend(req: Request, res: Response, next: NextFunction) {
        const transaction = await this._database.sequelize.transaction();
        
        try {
            const { friendId }: { friendId: string; } = req.body;
            const userId = (req.user as ISafeUser).id;

            if (!friendId) {
                return next(new FriendsError(ErrorTextsApi.SUBSCRIBED_ID_NOT_FOUND));
            }

            const existSubscriber = await this._database.models.subscribers.findOne({
                where: { userId, subscriberId: friendId },
                transaction
            });

            // Если пользователь уже подписан на меня - сразу добавляем его в друзья
            if (existSubscriber) {
                return this._acceptUser(req, res, next, { curTransaction: transaction });
            } else {
                // Создаем запись - я подписан на добавленного пользователя
                await this._database.models.subscribers.create({
                    userId: friendId,
                    subscriberId: userId,
                    leftInSubs: 0
                }, { transaction });

                await transaction.commit();

                res.json({ success: true });
            }
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Отписаться от пользователя
    private async _unsubscribeUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { friendId }: { friendId: string; } = req.body;
            const userId = (req.user as ISafeUser).id;

            if (!friendId) {
                return next(new FriendsError(ErrorTextsApi.UNSUBSCRIBED_ID_NOT_FOUND));
            }

            await this._database.models.subscribers.destroy({
                where: { userId: friendId, subscriberId: userId }
            });

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    };

    // Добавить пользователя из подписчиков в друзья
    private async _acceptUser(req: Request, res: Response, next: NextFunction, { curTransaction }: { curTransaction?: Transaction } = {}) {
        const transaction = curTransaction || await this._database.sequelize.transaction();

        try {
            const { friendId }: { friendId: string; } = req.body;
            const userId = (req.user as ISafeUser).id;

            if (!friendId) {
                return next(new FriendsError(ErrorTextsApi.ADD_TO_FRIEND_ID_NOT_FOUND));
            }

            // Удаляем пользователя из подписчиков
            await this._database.models.subscribers.destroy({
                where: { userId, subscriberId: friendId },
                transaction
            });

            // Я добавил этого пользователя
            await this._database.models.friends.create({
                userId,
                friendId
            }, { transaction });

            // Пользователь добавил меня
            await this._database.models.friends.create({
                userId: friendId,
                friendId: userId
            }, { transaction });

            await transaction.commit();

            // return нужен для того, чтобы вернуть результат, так как метод используется в другом методе
            return res.json({ success: true });
        } catch (error) {
            await transaction.rollback();
            // return нужен для того, чтобы вернуть результат, так как метод используется в другом методе
            return next(error);
        }
    };

    // Оставить пользователя в подписчиках
    private async _leftInSubscribers(req: Request, res: Response, next: NextFunction) {
        try {
            const { friendId }: { friendId: string; } = req.body;
            const userId = (req.user as ISafeUser).id;

            if (!friendId) {
                return next(new FriendsError(ErrorTextsApi.LEFT_TO_SUBSCRIBED_ID_NOT_FOUND));
            }

            await this._database.models.subscribers.update(
                { leftInSubs: 1 },
                { where: { userId, subscriberId: friendId } }
            );

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    };

    // Удалить из друзей
    private async _deleteFriend(req: Request, res: Response, next: NextFunction) {
        const transaction: Transaction = await this._database.sequelize.transaction();

        try {
            const { friendId }: { friendId: string; } = req.body;
            const userId = (req.user as ISafeUser).id;

            if (!friendId) {
                return next(new FriendsError(ErrorTextsApi.DELETED_ID_NOT_FOUND));
            }

            await this._database.models.friends.destroy({
                where: { userId, friendId },
                transaction
            });

            await this._database.models.friends.destroy({
                where: { userId: friendId, friendId: userId },
                transaction
            });

            await this._database.models.subscribers.create({
                userId,
                subscriberId: friendId,
                leftInSubs: 1
            }, { transaction });

            await transaction.commit();

            res.json({ success: true });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Заблокировать пользователя
    private async _blockFriend(req: Request, res: Response, next: NextFunction) {
        const transaction: Transaction = await this._database.sequelize.transaction();

        try {
            const { friendId }: { friendId: string; } = req.body;
            const userId = (req.user as ISafeUser).id;

            if (!friendId) {
                return next(new FriendsError(ErrorTextsApi.BLOCKED_ID_NOT_FOUND));
            }

            await this._database.models.friends.destroy({
                where: { userId, friendId },
                transaction
            });

            await this._database.models.friends.destroy({
                where: { userId: friendId, friendId: userId },
                transaction
            });

            await this._database.models.subscribers.destroy({ where: { userId }, transaction });
            await this._database.models.subscribers.destroy({ where: { userId: friendId }, transaction });

            await this._database.models.blockUsers.create({
                id: uuid(),
                userId,
                userBlocked: friendId
            }, { transaction });

            await transaction.commit();

            res.json({ success: true });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Проверка на блокировку пользователя 
    private async _checkBlockStatus(req: Request, res: Response, next: NextFunction) {
        const transaction: Transaction = await this._database.sequelize.transaction();

        try {
            const { checkingUser }: { checkingUser: string; } = req.body;
            const userId = (req.user as ISafeUser).id;

            if (!checkingUser) {
                return next(new FriendsError(ErrorTextsApi.CHECK_BLOCKED_ID_NOT_FOUND));
            }

            // Проверяем, заблокировали ли мы такого пользователя
            const isBlockedByMe = await this._database.models.blockUsers.findOne({
                where: { userId, userBlocked: checkingUser },
                transaction
            });

            // Проверяем, заблокировал ли меня такой пользователь
            const meIsBlocked = await this._database.models.blockUsers.findOne({
                where: { userId: checkingUser, userBlocked: userId },
                transaction
            });

            await transaction.commit();

            res.json({ success: true, isBlockedByMe, meIsBlocked });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };
};