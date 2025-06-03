"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const i18n_1 = require("@service/i18n");
const logger_1 = __importDefault(require("@service/logger"));
const controllers_1 = require("@errors/controllers");
const logger = (0, logger_1.default)("FriendsController");
;
// Класс, отвечающий за API друзей
class FriendsController {
    constructor(_app, _middleware, _database, _users) {
        this._app = _app;
        this._middleware = _middleware;
        this._database = _database;
        this._users = _users;
        this._init();
    }
    // Слушатели запросов контроллера FriendsController
    _init() {
        this._app.get(common_types_1.ApiRoutes.getFriendsNotification, this._middleware.mustAuthenticated.bind(this._middleware), this._getFriendsNotification.bind(this));
        // this._app.post(ApiRoutes.getFriendInfo, this._middleware.mustAuthenticated.bind(this._middleware), this._getFriendInfo.bind(this));
        this._app.post(common_types_1.ApiRoutes.getAllCounts, this._middleware.mustAuthenticated.bind(this._middleware), this._getAllCounts.bind(this));
        this._app.post(common_types_1.ApiRoutes.getPossibleFriends, this._middleware.mustAuthenticated.bind(this._middleware), this._getPossibleFriends.bind(this));
        this._app.post(common_types_1.ApiRoutes.getMyFriends, this._middleware.mustAuthenticated.bind(this._middleware), this._getMyFriends.bind(this));
        this._app.post(common_types_1.ApiRoutes.checkOnlineUser, this._middleware.mustAuthenticated.bind(this._middleware), this._checkOnlineUser.bind(this));
        this._app.post(common_types_1.ApiRoutes.getFollowers, this._middleware.mustAuthenticated.bind(this._middleware), this._getFollowers.bind(this));
        this._app.post(common_types_1.ApiRoutes.getBlockedFriends, this._middleware.mustAuthenticated.bind(this._middleware), this._getBlockedFriends.bind(this));
        this._app.post(common_types_1.ApiRoutes.getCommonFriends, this._middleware.mustAuthenticated.bind(this._middleware), this._getCommonFriends.bind(this));
        this._app.post(common_types_1.ApiRoutes.getIncomingRequests, this._middleware.mustAuthenticated.bind(this._middleware), this._getIncomingRequests.bind(this));
        this._app.post(common_types_1.ApiRoutes.getOutgoingRequests, this._middleware.mustAuthenticated.bind(this._middleware), this._getOutgoingRequests.bind(this));
        this._app.post(common_types_1.ApiRoutes.followFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._followFriend.bind(this));
        this._app.post(common_types_1.ApiRoutes.unfollow, this._middleware.mustAuthenticated.bind(this._middleware), this._unfollow.bind(this));
        this._app.post(common_types_1.ApiRoutes.addFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._addFriend.bind(this));
        this._app.post(common_types_1.ApiRoutes.acceptFriendRequest, this._middleware.mustAuthenticated.bind(this._middleware), this._acceptFriendRequest.bind(this));
        this._app.post(common_types_1.ApiRoutes.leftInFollowers, this._middleware.mustAuthenticated.bind(this._middleware), this._leftInFollowers.bind(this));
        this._app.post(common_types_1.ApiRoutes.deleteFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._deleteFriend.bind(this));
        this._app.post(common_types_1.ApiRoutes.blockFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._blockFriend.bind(this));
        this._app.post(common_types_1.ApiRoutes.unblockFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._unblockFriend.bind(this));
        // this._app.post(ApiRoutes.checkBlockStatus, this._middleware.mustAuthenticated.bind(this._middleware), this._checkBlockStatus.bind(this));
    }
    // Отправка события по сокет-соединению
    async _sendSocketEvent({ user, friendId, payload, socketActions }) {
        const foundFriend = this._users.get(friendId);
        // Если пользователь не онлайн - не отправляем ничего
        if (!foundFriend) {
            return;
        }
        const { to, broadcast } = socketActions;
        const toPayload = payload?.to || { user };
        const broadcastPayload = payload?.broadcast || { user: foundFriend };
        // Получаем сокет-контроллер разблокируемого пользователя
        const socketController = Array.from(foundFriend.sockets.values())[0];
        // Отправляем событие пользователю об его разблокировке (всем его открытым вкладкам)
        await socketController.sendTo(to, toPayload, friendId);
        // Отправляем событие текущему пользователю об удалении из заблокированных пользователей (всем его открытым вкладкам)
        await socketController.sendBroadcastTo(broadcast, broadcastPayload, user.id);
    }
    // Получить количество заявок в друзья для отрисовки в меню
    async _getFriendsNotification(req, res, next) {
        try {
            const userId = req.user.id;
            logger.debug("_getFriendsNotification [userId=%s]", userId);
            const friendsNotification = await this._database.repo.friendActions.getFriendsNotification({ data: { userId } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true, friendsNotification });
        }
        catch (error) {
            next(error);
        }
    }
    // Получить общее количество всех друзей на всех вкладках для первого входа (в независимости от страницы профиля или друзей)
    async _getAllCounts(req, res, next) {
        logger.debug("_getAllCounts [req.body=%j]", req.body);
        try {
            const { userId: anotherUserId } = req.body;
            const userId = req.user.id;
            const allCounts = await this._database.repo.friendActions.getAllCounts({ data: { userId, anotherUserId } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true, ...allCounts });
        }
        catch (error) {
            next(error);
        }
    }
    // Получение списка возможных друзей текущего пользователя
    async _getPossibleFriends(req, res, next) {
        logger.debug("_getPossibleFriends [req.body=%j]", req.body);
        try {
            const userId = req.user.id;
            const { limit, page = 0, search = "" } = req.body;
            const possibleFriendsData = await this._database.repo.friendActions.getPossibleFriends({ data: { userId, limit, page, search } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true, ...possibleFriendsData });
        }
        catch (error) {
            next(error);
        }
    }
    // Получение списка друзей текущего пользователя
    async _getMyFriends(req, res, next) {
        logger.debug("_getMyFriends [req.body=%j]", req.body);
        try {
            const { userId: anotherUserId, limit, lastCreatedAt = "", search = "" } = req.body;
            const userId = anotherUserId || req.user.id;
            const myFriendsData = await this._database.repo.friendActions.getMyFriends({ data: { userId, limit, lastCreatedAt, search } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true, ...myFriendsData });
        }
        catch (error) {
            next(error);
        }
    }
    // Получение списка онлайн друзей текущего пользователя
    async _checkOnlineUser(req, res, next) {
        logger.debug("_checkOnlineUser [req.body=%j]", req.body);
        try {
            const { ids = [], search = "" } = req.body;
            const userId = req.user.id;
            const onlineFriendsData = await this._database.repo.friendActions.getOnlineUsers({ data: { ids, userId, search } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true, ...onlineFriendsData });
        }
        catch (error) {
            next(error);
        }
    }
    // Получение списка подписчиков
    async _getFollowers(req, res, next) {
        logger.debug("_getFollowers [req.body=%j]", req.body);
        try {
            const { userId: anotherUserId, limit, lastCreatedAt = "", search = "" } = req.body;
            const userId = anotherUserId || req.user.id;
            const followersData = await this._database.repo.friendActions.getFollowers({ data: { userId, limit, lastCreatedAt, search } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true, ...followersData });
        }
        catch (error) {
            next(error);
        }
    }
    // Получение списка заблокированных пользователей
    async _getBlockedFriends(req, res, next) {
        logger.debug("_getBlockedFriends [req.body=%j]", req.body);
        try {
            const { limit, lastCreatedAt = "", search = "" } = req.body;
            const userId = req.user.id;
            const blockedFriendsData = await this._database.repo.friendActions.getBlockedFriends({ data: { userId, limit, lastCreatedAt, search } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true, ...blockedFriendsData });
        }
        catch (error) {
            next(error);
        }
    }
    // Получение списка общих друзей с открытым чужим профилем (используется только для подгрузки в чужом профиле)
    async _getCommonFriends(req, res, next) {
        logger.debug("_getCommonFriends [req.body=%j]", req.body);
        try {
            const { userId: anotherUserId, limit, lastCreatedAt = "", search = "" } = req.body;
            const userId = req.user.id;
            if (!anotherUserId) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.get_common_friends_id_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            const commonFriendsData = await this._database.repo.friendActions.getCommonFriends({ data: {
                    userId,
                    anotherUserId,
                    limit,
                    lastCreatedAt,
                    search,
                },
            });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true, ...commonFriendsData });
        }
        catch (error) {
            next(error);
        }
    }
    // // Получить специфичную информацию о друге, с которым открыт диалог
    // private async _getFriendInfo(req: Request, res: Response, next: NextFunction) {
    // 	logger.debug("_getFriendInfo  [req.body=%j]", req.body);
    // 	const transaction = await this._database.sequelize.transaction();
    // 	try {
    // 		const { chatId }: { chatId: string } = req.body;
    // 		const userId = req.user.id;
    // 		if (!chatId) {
    // 			await transaction.rollback();
    // 			return next(new FriendsError(t("chats.error.chat_id_not_found"), HTTPStatuses.BadRequest));
    // 		}
    // 		// eslint-disable-next-line @typescript-eslint/no-explicit-any
    // 		const userIdsInChat: any = await this._database.models.chats.findOne({
    // 			where: { id: chatId },
    // 			attributes: [ "userIds" ],
    // 			transaction,
    // 		});
    // 		let friendId: string | null = null;
    // 		if (userIdsInChat) {
    // 			const ids = userIdsInChat.userIds.split(",");
    // 			const findFriendId = ids.find((id: string) => id !== userId);
    // 			if (findFriendId) {
    // 				friendId = findFriendId;
    // 			}
    // 		}
    // 		const friendInfo = friendId
    // 			? await this._database.models.users.findByPk(friendId, {
    // 				attributes: [ "id", "avatarUrl", "firstName", "thirdName" ],
    // 				transaction,
    // 			})
    // 			: null;
    // 		if (!friendInfo) {
    // 			await transaction.rollback();
    // 			return next(new FriendsError(t("friends.error.friend_id_not_found"), HTTPStatuses.BadRequest));
    // 		}
    // 		await transaction.commit();
    // 		res.json({
    // 			success: true,
    // 			friendInfo: {
    // 				id: friendInfo.id,
    // 				avatarUrl: friendInfo.avatarUrl,
    // 				friendName: friendInfo.firstName + " " + friendInfo.thirdName,
    // 			},
    // 		});
    // 	} catch (error) {
    // 		await transaction.rollback();
    // 		next(error);
    // 	}
    // }
    // Получить все входящие запросы дружбы
    async _getIncomingRequests(req, res, next) {
        logger.debug("_getIncomingRequests [req.body=%j]", req.body);
        try {
            const userId = req.user.id;
            const { limit, lastCreatedAt = "", search = "" } = req.body;
            const incomingRequestsData = await this._database.repo.friendActions.getIncomingRequests({ data: { userId, limit, lastCreatedAt, search } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true, ...incomingRequestsData });
        }
        catch (error) {
            next(error);
        }
    }
    // Получить все исходящие запросы дружбы
    async _getOutgoingRequests(req, res, next) {
        logger.debug("_getOutgoingRequests [req.body=%j]", req.body);
        try {
            const userId = req.user.id;
            const { limit, lastCreatedAt = "", search = "" } = req.body;
            const outgoingRequestsData = await this._database.repo.friendActions.getOutgoingRequests({ data: { userId, limit, lastCreatedAt, search } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true, ...outgoingRequestsData });
        }
        catch (error) {
            next(error);
        }
    }
    // Добавить пользователя в друзья (подписываемся на него)
    async _followFriend(req, res, next) {
        logger.debug("_followFriend [req.body=%j]", req.body);
        try {
            const { friendId } = req.body;
            const userId = req.user.id;
            if (!friendId) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.subscribed_id_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            await this._sendSocketEvent({
                user: req.user,
                friendId,
                socketActions: {
                    to: common_types_1.SocketActions.FOLLOW_FRIEND,
                    broadcast: common_types_1.SocketActions.ADD_OUTGOING_REQUEST,
                },
            });
            await this._database.repo.friendActions.followFriend({ data: { userId, friendId } });
            res.status(common_types_1.HTTPStatuses.Created).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
    // Отписаться от пользователя
    async _unfollow(req, res, next) {
        logger.debug("_unfollow [req.body=%j]", req.body);
        try {
            const { friendId } = req.body;
            const userId = req.user.id;
            if (!friendId) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.unfollowed_id_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            await this._sendSocketEvent({
                user: req.user,
                friendId,
                socketActions: {
                    to: common_types_1.SocketActions.UNFOLLOW_FRIEND,
                    broadcast: common_types_1.SocketActions.REMOVE_OUTGOING_REQUEST,
                },
            });
            // Удаляем запись - я подписываюсь на добавленного пользователя
            await this._database.repo.friendActions.unfollowFriend({ data: { userId, friendId } });
            res.status(common_types_1.HTTPStatuses.NoContent).end();
        }
        catch (error) {
            next(error);
        }
    }
    // Добавить пользователя из подписчиков в друзья
    async _addFriend(req, res, next, { curTransaction } = {}) {
        logger.debug("_addFriend [req.body=%j]", req.body);
        const transaction = curTransaction || await this._database.sequelize.transaction();
        try {
            const { friendId } = req.body;
            const userId = req.user.id;
            if (!friendId) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.added_id_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            await this._sendSocketEvent({
                user: req.user,
                friendId,
                socketActions: {
                    to: common_types_1.SocketActions.ADD_TO_FRIEND,
                    broadcast: common_types_1.SocketActions.REMOVE_FOLLOWER,
                },
            });
            // Добавляем пользователя в друзья
            await this._database.repo.friendActions.addToFriend({ userId, friendId, transaction });
            await transaction.commit();
            res.status(common_types_1.HTTPStatuses.Created).json({ success: true });
        }
        catch (error) {
            await transaction.rollback();
            next(error);
        }
    }
    // Принятие запроса дружбы
    async _acceptFriendRequest(req, res, next) {
        logger.debug("_acceptFriendRequest [req.body=%j]", req.body);
        try {
            const { friendId } = req.body;
            const userId = req.user.id;
            if (!friendId) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.accept_friend_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            await this._sendSocketEvent({
                user: req.user,
                friendId,
                socketActions: {
                    to: common_types_1.SocketActions.ADD_FRIEND_REQUEST,
                    broadcast: common_types_1.SocketActions.REMOVE_FRIEND_REQUEST,
                },
            });
            await this._database.repo.friendActions.acceptFriendRequest({ data: { userId, friendId } });
            res.status(common_types_1.HTTPStatuses.NoContent).end();
        }
        catch (error) {
            next(error);
        }
    }
    // Оставить пользователя в подписчиках (отклонить запрос на дружбу)
    async _leftInFollowers(req, res, next) {
        logger.debug("_leftInFollowers [req.body=%j]", req.body);
        try {
            const { friendId } = req.body;
            const userId = req.user.id;
            if (!friendId) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.left_to_subscribed_id_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            await this._sendSocketEvent({
                user: req.user,
                friendId,
                payload: {
                    to: {
                        userId: req.user.id,
                    },
                },
                socketActions: {
                    to: common_types_1.SocketActions.REJECT_FRIEND_REQUEST,
                    broadcast: common_types_1.SocketActions.ADD_TO_FOLLOWER,
                },
            });
            await this._database.repo.friendActions.leftInFollowers({ data: { userId, friendId } });
            res.status(common_types_1.HTTPStatuses.NoContent).end();
        }
        catch (error) {
            next(error);
        }
    }
    // Удалить из друзей
    async _deleteFriend(req, res, next) {
        logger.debug("_deleteFriend [req.body=%j]", req.body);
        try {
            const { friendId } = req.body;
            const userId = req.user.id;
            if (!friendId) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.deleted_id_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            await this._sendSocketEvent({
                user: req.user,
                friendId,
                socketActions: {
                    to: common_types_1.SocketActions.DELETE_FRIEND,
                    broadcast: common_types_1.SocketActions.DELETING_FRIEND,
                },
            });
            await this._database.repo.friendActions.deleteFriend({ data: { userId, friendId } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
    // Заблокировать пользователя
    async _blockFriend(req, res, next) {
        logger.debug("_blockFriend [req.body=%j]", req.body);
        try {
            const { friendId } = req.body;
            const userId = req.user.id;
            if (!friendId) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.blocked_id_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            await this._sendSocketEvent({
                user: req.user,
                friendId,
                payload: {
                    to: {
                        userId: req.user.id,
                    },
                },
                socketActions: {
                    to: common_types_1.SocketActions.BLOCK_FRIEND,
                    broadcast: common_types_1.SocketActions.BLOCKING_FRIEND,
                },
            });
            await this._database.repo.friendActions.blockFriend({ data: { userId, friendId } });
            res.status(common_types_1.HTTPStatuses.NoContent).end();
        }
        catch (error) {
            next(error);
        }
    }
    // Разблокировать пользователя
    async _unblockFriend(req, res, next) {
        logger.debug("_unblockFriend [req.body=%j]", req.body);
        try {
            const { friendId } = req.body;
            const userId = req.user.id;
            if (!friendId) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.unblocked_id_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            await this._sendSocketEvent({
                user: req.user,
                friendId,
                socketActions: {
                    to: common_types_1.SocketActions.UNBLOCK_FRIEND,
                    broadcast: common_types_1.SocketActions.UNBLOCKING_FRIEND,
                },
            });
            await this._database.repo.friendActions.unblockFriend({ data: { userId, friendId } });
            res.status(common_types_1.HTTPStatuses.OK).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = FriendsController;
;
//# sourceMappingURL=Friends.js.map