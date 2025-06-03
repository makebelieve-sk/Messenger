"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const sequelize_1 = require("sequelize");
const friend_action_1 = __importDefault(require("@core/database/models/friend-action"));
const i18n_1 = require("@service/i18n");
const controllers_1 = require("@errors/controllers");
const index_1 = require("@errors/index");
const enums_1 = require("@custom-types/enums");
const associations_1 = __importDefault(require("@utils/associations"));
;
;
;
;
;
// Репозиторий, который содержит методы по работе с моделью FriendAction
class FriendActions {
    constructor(_repo) {
        this._repo = _repo;
        this._model = (0, friend_action_1.default)(this._repo.sequelize);
    }
    get model() {
        return this._model;
    }
    /**
     * Получить фильтр поиска по имени пользователя.
     * Важный момент: MS SQL гарантирует, что у столбца типа nvarchar сравнение и поиск регистро-независимы. Соот-но, не нужно использовать iLike,
     * как это было бы в PostgreSQL, например, или в других базах данных.
     */
    _getSearch(search) {
        return {
            [sequelize_1.Op.or]: [
                { firstName: { [sequelize_1.Op.like]: `%${search}%` } },
                { secondName: { [sequelize_1.Op.like]: `%${search}%` } },
                { thirdName: { [sequelize_1.Op.like]: `%${search}%` } },
            ],
        };
    }
    // Обработка ошибок
    _handleError(error, options) {
        const errorMessage = error.message || error;
        return new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", options) + errorMessage);
    }
    create({ creationAttributes, transaction }) {
        try {
            return this._model.create(creationAttributes, { transaction });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "create" });
        }
    }
    // Получение количества необработанных запросов на дружбу (либо не принятых, либо не отклоненных)
    async getFriendsNotification({ data, transaction }) {
        try {
            const { userId } = data;
            return await this._model.count({
                where: {
                    targetUserId: userId,
                    actionType: enums_1.FriendActionType.FOLLOWING,
                },
                include: [{
                        association: associations_1.default.SOURCE_USER,
                        where: {
                            isDeleted: false,
                        },
                        attributes: [],
                        required: true,
                    }],
                transaction,
            });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "getFriendsNotification" });
        }
    }
    // Получение количества всех друзей на всех вкладках переданного пользователя
    async getAllCounts({ data, transaction }) {
        try {
            const { userId, anotherUserId } = data;
            const countMyFriends = await this._getCountMyFriends({ userId: anotherUserId, transaction });
            const countFollowers = await this._getCountFollowers({ userId: anotherUserId, transaction });
            const countBlockedFriends = await this._getCountBlockedFriends({ userId: anotherUserId, transaction });
            const countSearchFriends = await this._getCountPossibleFriends({ userId: anotherUserId, transaction });
            const countIncomingRequests = await this._getCountIncomingRequests({ userId: anotherUserId, transaction });
            const countOutgoingRequests = await this._getCountOutgoingRequests({ userId: anotherUserId, transaction });
            const countCommonFriends = await this._getCountCommonFriends({ userId, anotherUserId, transaction });
            return {
                countSearchFriends,
                countIncomingRequests,
                countOutgoingRequests,
                countMyFriends,
                countFollowers,
                countBlockedFriends,
                countCommonFriends,
            };
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "getFriendsNotification" });
        }
    }
    // Получение друзей текущего пользователя
    async getMyFriends({ data, transaction }) {
        try {
            const { userId, limit, lastCreatedAt, search } = data;
            // Сначала получаем список записей дружбы из общей таблицы
            const foundFriendships = await this._model.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { sourceUserId: userId },
                        { targetUserId: userId },
                    ],
                    actionType: enums_1.FriendActionType.FRIEND,
                    ...(lastCreatedAt && {
                        createdAt: { [sequelize_1.Op.gt]: lastCreatedAt },
                    }),
                },
                attributes: ["sourceUserId", "targetUserId", "createdAt"],
                transaction,
            });
            // Извлекаем массив id друзей (удаляя дубликаты)
            const friendIds = new Set(foundFriendships.map(link => link.sourceUserId === userId
                ? link.targetUserId
                : link.sourceUserId));
            const myFriends = await this._repo.users.model.findAll({
                subQuery: false,
                where: {
                    id: {
                        [sequelize_1.Op.and]: [
                            { [sequelize_1.Op.ne]: userId },
                            { [sequelize_1.Op.in]: Array.from(friendIds) },
                        ],
                    },
                    isDeleted: false,
                    ...(search && this._getSearch(search)),
                },
                include: [{
                        association: associations_1.default.USER_WITH_AVATAR,
                        attributes: ["path", "createdAt"],
                        required: false,
                    }],
                limit: limit + 1,
                order: [
                    ["firstName", "ASC"],
                    ["thirdName", "ASC"],
                ],
                transaction,
            });
            const hasMore = myFriends.length > limit;
            if (hasMore) {
                myFriends.pop();
            }
            const count = await this._getCountMyFriends({ userId, transaction });
            return {
                count,
                hasMore,
                myFriends: myFriends.map(user => {
                    user.avatarUrl = user.UserWithAvatar?.path || "";
                    user.avatarCreateDate = user.UserWithAvatar?.createdAt || "";
                    return {
                        ...user.getEntity(),
                        createdAt: foundFriendships.find(friendShip => friendShip.sourceUserId === userId && friendShip.targetUserId === user.id ||
                            friendShip.sourceUserId === user.id && friendShip.targetUserId === userId)?.createdAt || "",
                    };
                }),
            };
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "getMyFriends" });
        }
    }
    // Получить количество друзей текущего пользователя
    _getCountMyFriends({ userId, transaction }) {
        return this._model.count({
            where: {
                [sequelize_1.Op.or]: [
                    { sourceUserId: userId },
                    { targetUserId: userId },
                ],
                actionType: enums_1.FriendActionType.FRIEND,
            },
            transaction,
        });
    }
    // Получение онлайн друзей текущего пользователя
    async getOnlineUsers({ data, transaction }) {
        try {
            const { ids, userId, search } = data;
            // Сначала получаем список записей дружбы из общей таблицы
            const foundFriendships = await this._model.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { sourceUserId: userId, targetUserId: { [sequelize_1.Op.in]: ids } },
                        { targetUserId: userId, sourceUserId: { [sequelize_1.Op.in]: ids } },
                    ],
                    actionType: enums_1.FriendActionType.FRIEND,
                },
                attributes: ["sourceUserId", "targetUserId"],
                transaction,
            });
            // Извлекаем массив id друзей (удаляя дубликаты)
            const friendIds = new Set(foundFriendships.map(link => link.sourceUserId === userId
                ? link.targetUserId
                : link.sourceUserId));
            const myFriends = await this._repo.users.model.findAll({
                subQuery: false,
                where: {
                    id: {
                        [sequelize_1.Op.and]: [
                            { [sequelize_1.Op.ne]: userId },
                            { [sequelize_1.Op.in]: Array.from(friendIds) },
                        ],
                    },
                    isDeleted: false,
                    ...(search && this._getSearch(search)),
                },
                include: [{
                        association: associations_1.default.USER_WITH_AVATAR,
                        attributes: ["path", "createdAt"],
                        required: false,
                    }],
                order: [
                    ["firstName", "ASC"],
                    ["thirdName", "ASC"],
                ],
                transaction,
            });
            return {
                count: myFriends.length,
                hasMore: false,
                onlineFriends: myFriends.map(user => {
                    user.avatarUrl = user.UserWithAvatar?.path || "";
                    user.avatarCreateDate = user.UserWithAvatar?.createdAt || "";
                    return user.getEntity();
                }),
            };
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "getOnlineUsers" });
        }
    }
    // Получение списка подписчиков текущего пользователя
    async getFollowers({ data, transaction }) {
        try {
            const { userId, limit, lastCreatedAt, search } = data;
            const followers = await this._repo.users.model.findAll({
                subQuery: false,
                where: {
                    id: { [sequelize_1.Op.ne]: userId },
                    isDeleted: false,
                    ...(search && this._getSearch(search)),
                },
                include: [{
                        association: associations_1.default.SENT_FRIEND_REQUESTS,
                        where: {
                            targetUserId: userId,
                            actionType: enums_1.FriendActionType.LEFT_IN_FOLLOWERS,
                            ...(lastCreatedAt && {
                                createdAt: { [sequelize_1.Op.gt]: lastCreatedAt },
                            }),
                        },
                        attributes: ["id", "createdAt"],
                        required: true,
                    }, {
                        association: associations_1.default.USER_WITH_AVATAR,
                        attributes: ["path", "createdAt"],
                        required: false,
                    }],
                limit: limit + 1,
                order: [
                    ["firstName", "ASC"],
                    ["thirdName", "ASC"],
                ],
                transaction,
            });
            const hasMore = followers.length > limit;
            if (hasMore) {
                followers.pop();
            }
            const count = await this._getCountFollowers({ userId, transaction });
            return {
                count,
                hasMore,
                followers: followers.map(user => {
                    user.avatarUrl = user.UserWithAvatar?.path || "";
                    user.avatarCreateDate = user.UserWithAvatar?.createdAt || "";
                    return {
                        ...user.getEntity(),
                        createdAt: user.SentFriendRequestsLog[0]?.createdAt || "",
                    };
                }),
            };
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "getFollowers" });
        }
    }
    // Получить количество подписчиков текущего пользователя
    _getCountFollowers({ userId, transaction }) {
        return this._model.count({
            where: {
                targetUserId: userId,
                actionType: enums_1.FriendActionType.LEFT_IN_FOLLOWERS,
            },
            transaction,
        });
    }
    // Получение списка заблокированных друзей текущим пользователем
    async getBlockedFriends({ data, transaction }) {
        try {
            const { userId, limit, lastCreatedAt, search } = data;
            const blockedFriends = await this._repo.users.model.findAll({
                subQuery: false,
                where: {
                    id: { [sequelize_1.Op.ne]: userId },
                    isDeleted: false,
                    ...(search && this._getSearch(search)),
                },
                include: [{
                        association: associations_1.default.RECEIVED_FRIEND_REQUESTS,
                        where: {
                            sourceUserId: userId,
                            actionType: enums_1.FriendActionType.BLOCKED,
                            ...(lastCreatedAt && {
                                createdAt: { [sequelize_1.Op.gt]: lastCreatedAt },
                            }),
                        },
                        attributes: ["id", "createdAt"],
                        required: true,
                    }, {
                        association: associations_1.default.USER_WITH_AVATAR,
                        attributes: ["path", "createdAt"],
                        required: false,
                    }],
                limit: limit + 1,
                order: [
                    ["firstName", "ASC"],
                    ["thirdName", "ASC"],
                ],
                transaction,
            });
            const hasMore = blockedFriends.length > limit;
            if (hasMore) {
                blockedFriends.pop();
            }
            const count = await this._getCountBlockedFriends({ userId, transaction });
            return {
                count,
                hasMore,
                blockedFriends: blockedFriends.map(user => {
                    user.avatarUrl = user.UserWithAvatar?.path || "";
                    user.avatarCreateDate = user.UserWithAvatar?.createdAt || "";
                    return {
                        ...user.getEntity(),
                        createdAt: user.ReceivedFriendRequestsLog[0]?.createdAt || "",
                    };
                }),
            };
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "FriendActions", method: "getBlockedFriends" }) + error.message);
        }
    }
    // Получить количество заблокированных друзей
    _getCountBlockedFriends({ userId, transaction }) {
        return this._model.count({
            where: {
                sourceUserId: userId,
                actionType: enums_1.FriendActionType.BLOCKED,
            },
            transaction,
        });
    }
    // Получение списка общих друзей (только на чужом профиле)
    async getCommonFriends({ data, transaction }) {
        try {
            const { userId, anotherUserId, limit, lastCreatedAt, search } = data;
            const sql = `
				WITH friendsA AS (
					SELECT
						CASE
							WHEN source_user_id = :userA THEN target_user_id
							ELSE source_user_id
						END AS friend_id,
						created_at
					FROM "Friend_Actions"
					WHERE action_type = :actionType AND 
						(source_user_id = :userA OR target_user_id = :userA) AND
						(:lastCreatedAt IS NULL OR created_at > :lastCreatedAt)
				),
				friendsB AS (
					SELECT
						CASE
							WHEN source_user_id = :userB THEN target_user_id
							ELSE source_user_id
						END AS friend_id,
						created_at
					FROM "Friend_Actions"
					WHERE action_type = :actionType AND 
						(source_user_id = :userB OR target_user_id = :userB) AND
						(:lastCreatedAt IS NULL OR created_at > :lastCreatedAt)
				)
				SELECT
					A.friend_id AS "friendId",
					CASE
						WHEN A.created_at >= B.created_at THEN A.created_at
						ELSE B.created_at
					END AS "createdAt"
				FROM friendsA A
				INNER JOIN friendsB B ON A.friend_id = B.friend_id
			`;
            const foundCommonFriends = await this._repo.sequelize.query(sql, {
                type: sequelize_1.QueryTypes.SELECT,
                replacements: {
                    userA: userId,
                    userB: anotherUserId,
                    actionType: enums_1.FriendActionType.FRIEND,
                    lastCreatedAt: lastCreatedAt,
                },
                transaction,
                raw: true,
            });
            if (!foundCommonFriends || !foundCommonFriends.length) {
                return {
                    count: 0,
                    hasMore: false,
                    commonFriends: [],
                };
            }
            const commonFriends = await this._repo.users.model.findAll({
                subQuery: false,
                where: {
                    id: { [sequelize_1.Op.in]: foundCommonFriends.map(commonFriend => commonFriend.friendId) },
                    isDeleted: false,
                    ...(search && this._getSearch(search)),
                },
                include: [{
                        association: associations_1.default.USER_WITH_AVATAR,
                        attributes: ["path", "createdAt"],
                        required: false,
                    }],
                limit: limit + 1,
                order: [
                    ["firstName", "ASC"],
                    ["thirdName", "ASC"],
                ],
                transaction,
            });
            const hasMore = commonFriends.length > limit;
            if (hasMore) {
                commonFriends.pop();
            }
            const count = await this._getCountCommonFriends({ userId, anotherUserId, transaction });
            return {
                count,
                hasMore,
                commonFriends: commonFriends.map(user => {
                    user.avatarUrl = user.UserWithAvatar?.path || "";
                    user.avatarCreateDate = user.UserWithAvatar?.createdAt || "";
                    return {
                        ...user.getEntity(),
                        createdAt: foundCommonFriends.find(commonFriend => commonFriend.friendId === user.id)?.createdAt || "",
                    };
                }),
            };
        }
        catch (error) {
            throw new index_1.RepositoryError((0, i18n_1.t)("repository.error.internal_db", { repo: "FriendActions", method: "getCommonFriends" }) + error.message);
        }
    }
    // Получить количество общих друзей
    async _getCountCommonFriends({ userId, anotherUserId, transaction }) {
        const sql = `
			WITH friendsA AS (
				SELECT
					CASE
						WHEN source_user_id = :userA THEN target_user_id
						ELSE source_user_id
					END AS friend_id
				FROM "Friend_Actions"
				WHERE action_type = :actionType AND (source_user_id = :userA OR target_user_id = :userA)
			),
			friendsB AS (
				SELECT
					CASE
						WHEN source_user_id = :userB THEN target_user_id
						ELSE source_user_id
					END AS friend_id
				FROM "Friend_Actions"
				WHERE action_type = :actionType AND (source_user_id = :userB OR target_user_id = :userB)
			)
			SELECT COUNT(*) AS "commonCount"
			FROM friendsA A
			INNER JOIN friendsB B ON A.friend_id = B.friend_id;
		`;
        const rows = await this._repo.sequelize.query(sql, {
            type: sequelize_1.QueryTypes.SELECT,
            replacements: {
                userA: userId,
                userB: anotherUserId,
                actionType: enums_1.FriendActionType.FRIEND,
            },
            transaction,
            raw: true,
            plain: true,
        });
        return rows
            ? parseInt(rows.commonCount, 10)
            : 0;
    }
    // Получаем возможных друзей для пользователя
    async getPossibleFriends({ data, transaction }) {
        try {
            const { userId, limit, search, page } = data;
            const foundFriends = await this._repo.users.model.findAll({
                subQuery: false,
                where: {
                    id: { [sequelize_1.Op.ne]: userId },
                    [sequelize_1.Op.and]: (0, sequelize_1.literal)(`
						NOT EXISTS (
							SELECT 1
							FROM [Friend_Actions] AS [Friend_Action]
							WHERE ([Friend_Action].source_user_id = '${userId}' AND [Friend_Action].target_user_id = [User].id) OR
								([Friend_Action].target_user_id = '${userId}' AND [Friend_Action].source_user_id = [User].id)
						)
					`),
                    isDeleted: false,
                    ...(search && {
                        [sequelize_1.Op.or]: [
                            { firstName: { [sequelize_1.Op.like]: `%${search}%` } },
                            { secondName: { [sequelize_1.Op.like]: `%${search}%` } },
                            { thirdName: { [sequelize_1.Op.like]: `%${search}%` } },
                        ],
                    }),
                },
                include: [{
                        association: associations_1.default.USER_WITH_AVATAR,
                        attributes: ["path", "createdAt"],
                        required: false,
                    }],
                limit: limit + 1,
                offset: page * limit,
                order: [
                    ["firstName", "ASC"],
                    ["thirdName", "ASC"],
                ],
                transaction,
            });
            const hasMore = foundFriends.length > limit;
            if (hasMore) {
                foundFriends.pop();
            }
            const count = await this._getCountPossibleFriends({ userId, transaction });
            return {
                count,
                hasMore,
                possibleFriends: foundFriends.map(user => {
                    user.avatarUrl = user.UserWithAvatar?.path || "";
                    user.avatarCreateDate = user.UserWithAvatar?.createdAt || "";
                    return user.getEntity();
                }),
            };
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "getPossibleFriends" });
        }
    }
    // Получить количество возможных друзей
    _getCountPossibleFriends({ userId, transaction }) {
        return this._repo.users.model.count({
            where: {
                id: { [sequelize_1.Op.ne]: userId },
                isDeleted: false,
                [sequelize_1.Op.and]: (0, sequelize_1.literal)(`
					NOT EXISTS (
						SELECT 1
						FROM [Friend_Actions] AS [Friend_Action]
						WHERE ([Friend_Action].source_user_id = '${userId}' AND [Friend_Action].target_user_id = [User].id) OR
							([Friend_Action].target_user_id = '${userId}' AND [Friend_Action].source_user_id = [User].id)
					)
				`),
            },
            transaction,
        });
    }
    // Получаем входящие запросы дружбы
    async getIncomingRequests({ data, transaction }) {
        try {
            const { userId, limit, lastCreatedAt, search } = data;
            const incomingRequests = await this._repo.users.model.findAll({
                subQuery: false,
                where: {
                    id: { [sequelize_1.Op.ne]: userId },
                    isDeleted: false,
                    ...(search && this._getSearch(search)),
                },
                include: [{
                        association: associations_1.default.SENT_FRIEND_REQUESTS,
                        where: {
                            targetUserId: userId,
                            actionType: enums_1.FriendActionType.FOLLOWING,
                            ...(lastCreatedAt && {
                                createdAt: { [sequelize_1.Op.gt]: lastCreatedAt },
                            }),
                        },
                        attributes: ["id", "createdAt"],
                        required: true,
                    }, {
                        association: associations_1.default.USER_WITH_AVATAR,
                        attributes: ["path", "createdAt"],
                        required: false,
                    }],
                limit: limit + 1,
                order: [
                    ["firstName", "ASC"],
                    ["thirdName", "ASC"],
                ],
                transaction,
            });
            const hasMore = incomingRequests.length > limit;
            if (hasMore) {
                incomingRequests.pop();
            }
            const count = await this._getCountIncomingRequests({ userId, transaction });
            return {
                count,
                hasMore,
                incomingRequests: incomingRequests.map(request => {
                    request.avatarUrl = request.UserWithAvatar?.path || "";
                    request.avatarCreateDate = request.UserWithAvatar?.createdAt || "";
                    return {
                        ...request.getEntity(),
                        createdAt: request.SentFriendRequestsLog[0]?.createdAt || "",
                    };
                }),
            };
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "getIncomingRequests" });
        }
    }
    // Получаем количество входящих заявок на дружбу
    _getCountIncomingRequests({ userId, transaction }) {
        return this._model.count({
            where: {
                targetUserId: userId,
                actionType: enums_1.FriendActionType.FOLLOWING,
            },
            transaction,
        });
    }
    // Получаем исходящие запросы дружбы
    async getOutgoingRequests({ data, transaction }) {
        try {
            const { userId, limit, lastCreatedAt, search } = data;
            const outgoingRequests = await this._repo.users.model.findAll({
                subQuery: false,
                where: {
                    id: { [sequelize_1.Op.ne]: userId },
                    isDeleted: false,
                    ...(search && this._getSearch(search)),
                },
                include: [{
                        association: associations_1.default.RECEIVED_FRIEND_REQUESTS,
                        where: {
                            sourceUserId: userId,
                            [sequelize_1.Op.or]: [
                                { actionType: enums_1.FriendActionType.FOLLOWING },
                                { actionType: enums_1.FriendActionType.LEFT_IN_FOLLOWERS },
                            ],
                            ...(lastCreatedAt && {
                                createdAt: { [sequelize_1.Op.gt]: lastCreatedAt },
                            }),
                        },
                        attributes: ["id", "createdAt"],
                        required: true,
                    }, {
                        association: associations_1.default.USER_WITH_AVATAR,
                        attributes: ["path", "createdAt"],
                        required: false,
                    }],
                limit: limit + 1,
                order: [
                    ["firstName", "ASC"],
                    ["thirdName", "ASC"],
                ],
                transaction,
            });
            const hasMore = outgoingRequests.length > limit;
            if (hasMore) {
                outgoingRequests.pop();
            }
            const count = await this._getCountOutgoingRequests({ userId, transaction });
            return {
                count,
                hasMore,
                outgoingRequests: outgoingRequests.map(request => {
                    request.avatarUrl = request.UserWithAvatar?.path || "";
                    request.avatarCreateDate = request.UserWithAvatar?.createdAt || "";
                    return {
                        ...request.getEntity(),
                        createdAt: request.ReceivedFriendRequestsLog[0]?.createdAt || "",
                    };
                }),
            };
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "getOutgoingRequests" });
        }
    }
    // Получить количество исходящих заявок
    _getCountOutgoingRequests({ userId, transaction }) {
        return this._model.count({
            where: {
                sourceUserId: userId,
                [sequelize_1.Op.or]: [
                    { actionType: enums_1.FriendActionType.FOLLOWING },
                    { actionType: enums_1.FriendActionType.LEFT_IN_FOLLOWERS },
                ],
            },
            transaction,
        });
    }
    // Проверяем, подписан ли пользователь на другого пользователя
    async checkFollowing({ data, transaction }) {
        try {
            const { sourceUserId, targetUserId } = data;
            const foundFollowing = await this._model.findOne({
                where: {
                    sourceUserId,
                    targetUserId,
                    [sequelize_1.Op.or]: [
                        { actionType: enums_1.FriendActionType.FOLLOWING },
                        { actionType: enums_1.FriendActionType.LEFT_IN_FOLLOWERS },
                    ],
                },
                attributes: ["id"],
                transaction,
            });
            // Проверяем, что текущий или переданный пользователь подписан друг на друга
            if (!foundFollowing) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.followed_link_not_found"), common_types_1.HTTPStatuses.BadRequest);
            }
            return foundFollowing;
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "checkFollowing" });
        }
    }
    // Подписываемся на пользователя (только мы добавляем его в друзья)
    async followFriend({ data, transaction }) {
        try {
            const { userId, friendId } = data;
            await this.create({
                creationAttributes: {
                    sourceUserId: userId,
                    targetUserId: friendId,
                    actionType: enums_1.FriendActionType.FOLLOWING,
                },
                transaction,
            });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "followFriend" });
        }
    }
    // Отписываемся от пользователя
    async unfollowFriend({ data, transaction }) {
        try {
            const { userId, friendId } = data;
            // Проверяем, что текущий пользователь подписан на отписываемого пользователя
            await this.checkFollowing({ data: { sourceUserId: userId, targetUserId: friendId }, transaction });
            await this._model.destroy({
                where: {
                    sourceUserId: userId,
                    targetUserId: friendId,
                    [sequelize_1.Op.or]: [
                        { actionType: enums_1.FriendActionType.FOLLOWING },
                        { actionType: enums_1.FriendActionType.LEFT_IN_FOLLOWERS },
                    ],
                },
                transaction,
            });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "unfollowFriend" });
        }
    }
    // Устанавливаем дружбу между текущим и добавляемым пользователями
    async addToFriend({ userId, friendId, transaction }) {
        try {
            const existFollow = await this._model.findOne({
                where: {
                    [sequelize_1.Op.and]: [
                        {
                            [sequelize_1.Op.or]: [
                                { sourceUserId: userId, targetUserId: friendId },
                                { sourceUserId: friendId, targetUserId: userId },
                            ],
                        },
                        {
                            actionType: {
                                [sequelize_1.Op.in]: [enums_1.FriendActionType.FOLLOWING, enums_1.FriendActionType.LEFT_IN_FOLLOWERS],
                            },
                        },
                    ],
                },
                transaction,
            });
            // Если нет текущей у текущего или добавляемого пользователя, выкидываем ошибку
            if (!existFollow) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.subscribe_id_not_found"), common_types_1.HTTPStatuses.NotFound);
            }
            await existFollow.update({
                actionType: enums_1.FriendActionType.FRIEND,
                createdAt: new Date().toISOString(),
            }, { transaction });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "addToFriend" });
        }
    }
    // Принять запрос пользователя о дружбе
    async acceptFriendRequest({ data, transaction }) {
        try {
            const { userId, friendId } = data;
            // Проверяем, что принимаемый пользователь подписан на текущего пользователя
            const existFollowing = await this.checkFollowing({ data: { sourceUserId: friendId, targetUserId: userId }, transaction });
            await existFollowing.update({
                actionType: enums_1.FriendActionType.FRIEND,
                createdAt: new Date().toISOString(),
            }, { transaction });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "acceptFriendRequest" });
        }
    }
    // Оставить пользователя в подписчиках (отказать в предложении дружбы)
    async leftInFollowers({ data, transaction }) {
        try {
            const { userId, friendId } = data;
            // Проверяем, что текущий пользователь подписан на отказываемого пользователя
            const existFollowing = await this.checkFollowing({ data: { sourceUserId: friendId, targetUserId: userId }, transaction });
            await existFollowing.update({
                actionType: enums_1.FriendActionType.LEFT_IN_FOLLOWERS,
                createdAt: new Date().toISOString(),
            }, { transaction });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "leftInFollowers" });
        }
    }
    // Проверка дружбы между текущим и переданным пользователями
    async _checkFriendShip({ data, transaction }) {
        try {
            const { userId, friendId } = data;
            const existFriendShip = await this._model.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { sourceUserId: userId, targetUserId: friendId },
                        { sourceUserId: friendId, targetUserId: userId },
                    ],
                    actionType: enums_1.FriendActionType.FRIEND,
                },
                transaction,
            });
            // Если нет друбжы между текущим и удаляемым пользователями - выбрасываем ошибку
            if (!existFriendShip) {
                throw new controllers_1.FriendsError((0, i18n_1.t)("friends.error.friendship_not_exist"), common_types_1.HTTPStatuses.NotFound);
            }
            return existFriendShip;
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "_checkFriendShip" });
        }
    }
    // Удаляем пользователя из друзей
    async deleteFriend({ data, transaction }) {
        try {
            const { userId, friendId } = data;
            const existFriendsShip = await this._checkFriendShip({ data: { userId, friendId }, transaction });
            /**
             * Изменяем запись так, чтобы текущий пользователь был в роли добавляемого в друзья,
             * а удаляемый пользователь был инициатором дружбы. Также, обновляем тип дружбы между ними
             */
            await existFriendsShip.update({
                sourceUserId: friendId,
                targetUserId: userId,
                actionType: enums_1.FriendActionType.LEFT_IN_FOLLOWERS,
                createdAt: new Date().toISOString(),
            }, { transaction });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "deleteFriend" });
        }
    }
    // Блокируем пользователя
    async blockFriend({ data, transaction }) {
        try {
            const { userId, friendId } = data;
            const existFriendsShip = await this._checkFriendShip({ data: { userId, friendId }, transaction });
            // Блокируем пользователя
            await existFriendsShip.update({
                actionType: enums_1.FriendActionType.BLOCKED,
                createdAt: new Date().toISOString(),
            }, { transaction });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "blockFriend" });
        }
    }
    // Разблокируем пользователя
    async unblockFriend({ data, transaction }) {
        try {
            const { userId, friendId } = data;
            await this.destroy({
                filters: {
                    [sequelize_1.Op.or]: [
                        { sourceUserId: userId, targetUserId: friendId },
                        { sourceUserId: friendId, targetUserId: userId },
                    ],
                    actionType: enums_1.FriendActionType.BLOCKED,
                },
                transaction,
            });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "unblockFriend" });
        }
    }
    async destroy({ filters, transaction }) {
        try {
            await this._model.destroy({ where: filters, transaction });
        }
        catch (error) {
            throw this._handleError(error, { repo: "FriendActions", method: "destroy" });
        }
    }
}
exports.default = FriendActions;
//# sourceMappingURL=FriendActions.js.map