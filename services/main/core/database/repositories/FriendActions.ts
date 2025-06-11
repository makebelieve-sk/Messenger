import { HTTPStatuses } from "common-types";
import { literal, Op, QueryTypes, type Transaction, type WhereOptions } from "sequelize";

import createFriendActions, { type CreationAttributes, FriendAction } from "@core/database/models/friend-action";
import type Repository from "@core/database/Repository";
import { t } from "@service/i18n";
import { FriendsError } from "@errors/controllers";
import { RepositoryError } from "@errors/index";
import { FriendActionType } from "@custom-types/enums";
import AliasAssociations from "@utils/associations";

interface IGetFriends {
	data: {
		userId: string;
		limit: number;
		lastCreatedAt: string;
		search: string;
	};
	transaction?: Transaction;
};

interface IGetPossibleFriends {
	data: {
		userId: string;
		limit: number;
		page: number;
		search: string;
	};
	transaction?: Transaction;
};

interface IGetCount {
	userId: string;
	transaction?: Transaction;
};

interface IFriendAction {
	data: {
		userId: string;
		friendId: string;
	};
	transaction?: Transaction;
};

interface IGetOnlineUsers { 
	data: { 
		ids: string[]; 
		userId: string;
		search: string;
	}, 
	transaction?: Transaction; 
};

// Репозиторий, который содержит методы по работе с моделью FriendAction
export default class FriendActions {
	private _model: typeof FriendAction;

	constructor(private readonly _repo: Repository) {
		this._model = createFriendActions(this._repo.sequelize);
	}

	get model() {
		return this._model;
	}

	/**
	 * Получить фильтр поиска по имени пользователя.
	 * Важный момент: MS SQL гарантирует, что у столбца типа nvarchar сравнение и поиск регистро-независимы. Соот-но, не нужно использовать iLike,
	 * как это было бы в PostgreSQL, например, или в других базах данных.
	 */
	private _getSearch(search: string) {
		return {
			[Op.or]: [
				{ firstName: { [Op.like]: `%${search}%` } },
				{ secondName: { [Op.like]: `%${search}%` } },
				{ thirdName: { [Op.like]: `%${search}%` } },
			],
		};
	}

	// Обработка ошибок
	private _handleError(error: Error, options: { repo: string; method: keyof typeof FriendActions.prototype | "_checkFriendShip"; }) {
		const errorMessage = error.message || error;
		return new RepositoryError(t("repository.error.internal_db", options) + errorMessage);
	}

	create({ creationAttributes, transaction }: { creationAttributes: CreationAttributes; transaction?: Transaction; }) {
		try {
			return this._model.create(creationAttributes, { transaction });
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "create" });
		}
	}

	// Получение количества необработанных запросов на дружбу (либо не принятых, либо не отклоненных)
	async getFriendsNotification({ data, transaction }: { data: { userId: string; }; transaction?: Transaction; }) {
		try {
			const { userId } = data;

			return await this._model.count({
				where: {
					targetUserId: userId,
					actionType: FriendActionType.FOLLOWING,
				},
				include: [ {
					association: AliasAssociations.SOURCE_USER,
					where: {
						isDeleted: false,
					},
					attributes: [],
					required: true,
				} ],
				transaction,
			});
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "getFriendsNotification" });
		}
	}

	// Получение количества всех друзей на всех вкладках переданного пользователя
	async getAllCounts({ data, transaction }: { data: { userId: string; anotherUserId: string; }; transaction?: Transaction; }) {
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
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "getFriendsNotification" });
		}
	}

	// Получение друзей текущего пользователя
	async getMyFriends({ data, transaction }: IGetFriends) {
		try {
			const { userId, limit, lastCreatedAt, search } = data;

			// Сначала получаем список записей дружбы из общей таблицы
			const foundFriendships = await this._model.findAll({
				where: {
					[Op.or]: [
						{ sourceUserId: userId },
						{ targetUserId: userId },
					],
					actionType: FriendActionType.FRIEND,
					...(lastCreatedAt && {
						createdAt: { [Op.gt]: lastCreatedAt },
					}),
				},
				attributes: [ "sourceUserId", "targetUserId", "createdAt" ],
				transaction,
			});

			// Извлекаем массив id друзей (удаляя дубликаты)
			const friendIds = new Set(foundFriendships.map(link =>
				link.sourceUserId === userId
					? link.targetUserId
					: link.sourceUserId,
			));

			const myFriends = await this._repo.users.model.findAll({
				subQuery: false,
				where: {
					id: {
						[Op.and]: [
							{ [Op.ne]: userId },
							{ [Op.in]: Array.from(friendIds) },
						],
					},
					isDeleted: false,
					...(search && this._getSearch(search)),
				},
				include: [ {
					association: AliasAssociations.USER_WITH_AVATAR,
					attributes: [ "path", "createdAt" ],
					required: false,
				} ],
				limit: limit + 1,
				order: [
					[ "firstName", "ASC" ],
					[ "thirdName", "ASC" ],
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
						createdAt: foundFriendships.find(friendShip =>
							friendShip.sourceUserId === userId && friendShip.targetUserId === user.id ||
							friendShip.sourceUserId === user.id && friendShip.targetUserId === userId,
						)?.createdAt || "",
					};
				}),
			};
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "getMyFriends" });
		}
	}

	// Получить количество друзей текущего пользователя
	private _getCountMyFriends({ userId, transaction }: IGetCount) {
		return this._model.count({
			where: {
				[Op.or]: [
					{ sourceUserId: userId },
					{ targetUserId: userId },
				],
				actionType: FriendActionType.FRIEND,
			},
			transaction,
		});
	}

	// Получение онлайн друзей текущего пользователя
	async getOnlineUsers({ data, transaction }: IGetOnlineUsers) {
		try {
			const { ids, userId, search } = data;

			// Сначала получаем список записей дружбы из общей таблицы
			const foundFriendships = await this._model.findAll({
				where: {
					[Op.or]: [
						{ sourceUserId: userId, targetUserId: { [Op.in]: ids } },
						{ targetUserId: userId, sourceUserId: { [Op.in]: ids } },
					],
					actionType: FriendActionType.FRIEND,
				},
				attributes: [ "sourceUserId", "targetUserId" ],
				transaction,
			});

			// Извлекаем массив id друзей (удаляя дубликаты)
			const friendIds = new Set(foundFriendships.map(link =>
				link.sourceUserId === userId
					? link.targetUserId
					: link.sourceUserId,
			));

			const myFriends = await this._repo.users.model.findAll({
				subQuery: false,
				where: {
					id: {
						[Op.and]: [
							{ [Op.ne]: userId },
							{ [Op.in]: Array.from(friendIds) },
						],
					},
					isDeleted: false,
					...(search && this._getSearch(search)),
				},
				include: [ {
					association: AliasAssociations.USER_WITH_AVATAR,
					attributes: [ "path", "createdAt" ],
					required: false,
				} ],
				order: [
					[ "firstName", "ASC" ],
					[ "thirdName", "ASC" ],
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
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "getOnlineUsers" });
		}
	}

	// Получение списка подписчиков текущего пользователя
	async getFollowers({ data, transaction }: IGetFriends) {
		try {
			const { userId, limit, lastCreatedAt, search } = data;

			const followers = await this._repo.users.model.findAll({
				subQuery: false,
				where: {
					id: { [Op.ne]: userId },
					isDeleted: false,
					...(search && this._getSearch(search)),
				},
				include: [ {
					association: AliasAssociations.SENT_FRIEND_REQUESTS,
					where: {
						targetUserId: userId,
						actionType: FriendActionType.LEFT_IN_FOLLOWERS,
						...(lastCreatedAt && {
							createdAt: { [Op.gt]: lastCreatedAt },
						}),
					},
					attributes: [ "id", "createdAt" ],
					required: true,
				}, {
					association: AliasAssociations.USER_WITH_AVATAR,
					attributes: [ "path", "createdAt" ],
					required: false,
				} ],
				limit: limit + 1,
				order: [
					[ "firstName", "ASC" ],
					[ "thirdName", "ASC" ],
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
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "getFollowers" });
		}
	}

	// Получить количество подписчиков текущего пользователя
	private _getCountFollowers({ userId, transaction }: IGetCount) {
		return this._model.count({
			where: {
				targetUserId: userId,
				actionType: FriendActionType.LEFT_IN_FOLLOWERS,
			},
			transaction,
		});
	}

	// Получение списка заблокированных друзей текущим пользователем
	async getBlockedFriends({ data, transaction }: IGetFriends) {
		try {
			const { userId, limit, lastCreatedAt, search } = data;

			const blockedFriends = await this._repo.users.model.findAll({
				subQuery: false,
				where: {
					id: { [Op.ne]: userId },
					isDeleted: false,
					...(search && this._getSearch(search)),
				},
				include: [ {
					association: AliasAssociations.RECEIVED_FRIEND_REQUESTS,
					where: {
						sourceUserId: userId,
						actionType: FriendActionType.BLOCKED,
						...(lastCreatedAt && {
							createdAt: { [Op.gt]: lastCreatedAt },
						}),
					},
					attributes: [ "id", "createdAt" ],
					required: true,
				}, {
					association: AliasAssociations.USER_WITH_AVATAR,
					attributes: [ "path", "createdAt" ],
					required: false,
				} ],
				limit: limit + 1,
				order: [
					[ "firstName", "ASC" ],
					[ "thirdName", "ASC" ],
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
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "FriendActions", method: "getBlockedFriends" }) + (error as Error).message);
		}
	}

	// Получить количество заблокированных друзей
	private _getCountBlockedFriends({ userId, transaction }: IGetCount) {
		return this._model.count({
			where: {
				sourceUserId: userId,
				actionType: FriendActionType.BLOCKED,
			},
			transaction,
		});
	}

	// Получение списка общих друзей (только на чужом профиле)
	async getCommonFriends({ data, transaction }: IGetFriends & { data: { anotherUserId: string; }; }) {
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

			const foundCommonFriends = await this._repo.sequelize.query<{ friendId: string; createdAt: string; }>(sql, {
				type: QueryTypes.SELECT,
				replacements: {
					userA: userId,
					userB: anotherUserId,
					actionType: FriendActionType.FRIEND,
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
					id: { [Op.in]: foundCommonFriends.map(commonFriend => commonFriend.friendId) },
					isDeleted: false,
					...(search && this._getSearch(search)),
				},
				include: [ {
					association: AliasAssociations.USER_WITH_AVATAR,
					attributes: [ "path", "createdAt" ],
					required: false,
				} ],
				limit: limit + 1,
				order: [
					[ "firstName", "ASC" ],
					[ "thirdName", "ASC" ],
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
		} catch (error) {
			throw new RepositoryError(t("repository.error.internal_db", { repo: "FriendActions", method: "getCommonFriends" }) + (error as Error).message);
		}
	}

	// Получить количество общих друзей
	private async _getCountCommonFriends({ userId, anotherUserId, transaction }: IGetCount & { anotherUserId: string; }) {
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

		const rows = await this._repo.sequelize.query<{ commonCount: string; }>(sql, {
			type: QueryTypes.SELECT,
			replacements: {
				userA: userId,
				userB: anotherUserId,
				actionType: FriendActionType.FRIEND,
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
	async getPossibleFriends({ data, transaction }: IGetPossibleFriends) {
		try {
			const { userId, limit, search, page } = data;

			const foundFriends = await this._repo.users.model.findAll({
				subQuery: false,
				where: {
					id: { [Op.ne]: userId },
					[Op.and]: literal(`
						NOT EXISTS (
							SELECT 1
							FROM [Friend_Actions] AS [Friend_Action]
							WHERE ([Friend_Action].source_user_id = '${userId}' AND [Friend_Action].target_user_id = [User].id) OR
								([Friend_Action].target_user_id = '${userId}' AND [Friend_Action].source_user_id = [User].id)
						)
					`),
					isDeleted: false,
					...(search && {
						[Op.or]: [
							{ firstName: { [Op.like]: `%${search}%` } },
							{ secondName: { [Op.like]: `%${search}%` } },
							{ thirdName: { [Op.like]: `%${search}%` } },
						],
					}),
				},
				include: [ {
					association: AliasAssociations.USER_WITH_AVATAR,
					attributes: [ "path", "createdAt" ],
					required: false,
				} ],
				limit: limit + 1,
				offset: page * limit,
				order: [
					[ "firstName", "ASC" ],
					[ "thirdName", "ASC" ],
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
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "getPossibleFriends" });
		}
	}

	// Получить количество возможных друзей
	private _getCountPossibleFriends({ userId, transaction }: IGetCount) {
		return this._repo.users.model.count({
			where: {
				id: { [Op.ne]: userId },
				isDeleted: false,
				[Op.and]: literal(`
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
	async getIncomingRequests({ data, transaction }: IGetFriends) {
		try {
			const { userId, limit, lastCreatedAt, search } = data;

			const incomingRequests = await this._repo.users.model.findAll({
				subQuery: false,
				where: {
					id: { [Op.ne]: userId },
					isDeleted: false,
					...(search && this._getSearch(search)),
				},
				include: [ {
					association: AliasAssociations.SENT_FRIEND_REQUESTS,
					where: {
						targetUserId: userId,
						actionType: FriendActionType.FOLLOWING,
						...(lastCreatedAt && {
							createdAt: { [Op.gt]: lastCreatedAt },
						}),
					},
					attributes: [ "id", "createdAt" ],
					required: true,
				}, {
					association: AliasAssociations.USER_WITH_AVATAR,
					attributes: [ "path", "createdAt" ],
					required: false,
				} ],
				limit: limit + 1,
				order: [
					[ "firstName", "ASC" ],
					[ "thirdName", "ASC" ],
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
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "getIncomingRequests" });
		}
	}

	// Получаем количество входящих заявок на дружбу
	private _getCountIncomingRequests({ userId, transaction }: IGetCount) {
		return this._model.count({
			where: {
				targetUserId: userId,
				actionType: FriendActionType.FOLLOWING,
			},
			transaction,
		});
	}

	// Получаем исходящие запросы дружбы
	async getOutgoingRequests({ data, transaction }: IGetFriends) {
		try {
			const { userId, limit, lastCreatedAt, search } = data;

			const outgoingRequests = await this._repo.users.model.findAll({
				subQuery: false,
				where: {
					id: { [Op.ne]: userId },
					isDeleted: false,
					...(search && this._getSearch(search)),
				},
				include: [ {
					association: AliasAssociations.RECEIVED_FRIEND_REQUESTS,
					where: {
						sourceUserId: userId,
						[Op.or]: [
							{ actionType: FriendActionType.FOLLOWING },
							{ actionType: FriendActionType.LEFT_IN_FOLLOWERS },
						],
						...(lastCreatedAt && {
							createdAt: { [Op.gt]: lastCreatedAt },
						}),
					},
					attributes: [ "id", "createdAt" ],
					required: true,
				}, {
					association: AliasAssociations.USER_WITH_AVATAR,
					attributes: [ "path", "createdAt" ],
					required: false,
				} ],
				limit: limit + 1,
				order: [
					[ "firstName", "ASC" ],
					[ "thirdName", "ASC" ],
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
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "getOutgoingRequests" });
		}
	}

	// Получить количество исходящих заявок
	private _getCountOutgoingRequests({ userId, transaction }: IGetCount) {
		return this._model.count({
			where: {
				sourceUserId: userId,
				[Op.or]: [
					{ actionType: FriendActionType.FOLLOWING },
					{ actionType: FriendActionType.LEFT_IN_FOLLOWERS },
				],
			},
			transaction,
		});
	}

	// Проверяем, подписан ли пользователь на другого пользователя
	async checkFollowing({ data, transaction }: { data: { sourceUserId: string; targetUserId: string; }; transaction?: Transaction; }) {
		try {
			const { sourceUserId, targetUserId } = data;

			const foundFollowing = await this._model.findOne({
				where: {
					sourceUserId,
					targetUserId,
					[Op.or]: [
						{ actionType: FriendActionType.FOLLOWING },
						{ actionType: FriendActionType.LEFT_IN_FOLLOWERS },
					],
				},
				attributes: [ "id" ],
				transaction,
			});

			// Проверяем, что текущий или переданный пользователь подписан друг на друга
			if (!foundFollowing) {
				throw new FriendsError(t("friends.error.followed_link_not_found"), HTTPStatuses.BadRequest);
			}

			return foundFollowing;
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "checkFollowing" });
		}
	}

	// Подписываемся на пользователя (только мы добавляем его в друзья)
	async followFriend({ data, transaction }: IFriendAction) {
		try {
			const { userId, friendId } = data;

			await this.create({
				creationAttributes: {
					sourceUserId: userId,
					targetUserId: friendId,
					actionType: FriendActionType.FOLLOWING,
				},
				transaction,
			});
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "followFriend" });
		}
	}

	// Отписываемся от пользователя
	async unfollowFriend({ data, transaction }: IFriendAction) {
		try {
			const { userId, friendId } = data;

			// Проверяем, что текущий пользователь подписан на отписываемого пользователя
			await this.checkFollowing({ data: { sourceUserId: userId, targetUserId: friendId }, transaction });

			await this._model.destroy({
				where: {
					sourceUserId: userId,
					targetUserId: friendId,
					[Op.or]: [
						{ actionType: FriendActionType.FOLLOWING },
						{ actionType: FriendActionType.LEFT_IN_FOLLOWERS },
					],
				},
				transaction,
			});
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "unfollowFriend" });
		}
	}

	// Устанавливаем дружбу между текущим и добавляемым пользователями
	async addToFriend({ userId, friendId, transaction }: { userId: string; friendId: string; transaction?: Transaction; }) {
		try {
			const existFollow = await this._model.findOne({
				where: {
					[Op.and]: [
						{
							[Op.or]: [
								{ sourceUserId: userId, targetUserId: friendId },
								{ sourceUserId: friendId, targetUserId: userId },
							],
						},
						{
							actionType: {
								[Op.in]: [ FriendActionType.FOLLOWING, FriendActionType.LEFT_IN_FOLLOWERS ],
							},
						},
					],
				},
				transaction,
			});

			// Если нет текущей у текущего или добавляемого пользователя, выкидываем ошибку
			if (!existFollow) {
				throw new FriendsError(t("friends.error.subscribe_id_not_found"), HTTPStatuses.NotFound);
			}

			await existFollow.update({
				actionType: FriendActionType.FRIEND,
				createdAt: new Date().toISOString(),
			}, { transaction });
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "addToFriend" });
		}
	}

	// Принять запрос пользователя о дружбе
	async acceptFriendRequest({ data, transaction }: IFriendAction) {
		try {
			const { userId, friendId } = data;

			// Проверяем, что принимаемый пользователь подписан на текущего пользователя
			const existFollowing = await this.checkFollowing({ data: { sourceUserId: friendId, targetUserId: userId }, transaction });

			await existFollowing.update({
				actionType: FriendActionType.FRIEND,
				createdAt: new Date().toISOString(),
			}, { transaction });
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "acceptFriendRequest" });
		}
	}

	// Оставить пользователя в подписчиках (отказать в предложении дружбы)
	async leftInFollowers({ data, transaction }: IFriendAction) {
		try {
			const { userId, friendId } = data;

			// Проверяем, что текущий пользователь подписан на отказываемого пользователя
			const existFollowing = await this.checkFollowing({ data: { sourceUserId: friendId, targetUserId: userId }, transaction });

			await existFollowing.update({
				actionType: FriendActionType.LEFT_IN_FOLLOWERS,
				createdAt: new Date().toISOString(),
			}, { transaction });
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "leftInFollowers" });
		}
	}

	// Проверка дружбы между текущим и переданным пользователями
	private async _checkFriendShip({ data, transaction }: IFriendAction) {
		try {
			const { userId, friendId } = data;

			const existFriendShip = await this._model.findOne({
				where: {
					[Op.or]: [
						{ sourceUserId: userId, targetUserId: friendId },
						{ sourceUserId: friendId, targetUserId: userId },
					],
					actionType: FriendActionType.FRIEND,
				},
				transaction,
			});

			// Если нет друбжы между текущим и удаляемым пользователями - выбрасываем ошибку
			if (!existFriendShip) {
				throw new FriendsError(t("friends.error.friendship_not_exist"), HTTPStatuses.NotFound);
			}

			return existFriendShip;
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "_checkFriendShip" });
		}
	}

	// Удаляем пользователя из друзей
	async deleteFriend({ data, transaction }: IFriendAction) {
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
				actionType: FriendActionType.LEFT_IN_FOLLOWERS,
				createdAt: new Date().toISOString(),
			}, { transaction });
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "deleteFriend" });
		}
	}

	// Блокируем пользователя
	async blockFriend({ data, transaction }: IFriendAction) {
		try {
			const { userId, friendId } = data;

			const existFriendsShip = await this._checkFriendShip({ data: { userId, friendId }, transaction });

			// Блокируем пользователя
			await existFriendsShip.update({
				actionType: FriendActionType.BLOCKED,
				createdAt: new Date().toISOString(),
			}, { transaction });
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "blockFriend" });
		}
	}

	// Разблокируем пользователя
	async unblockFriend({ data, transaction }: IFriendAction) {
		try {
			const { userId, friendId } = data;

			await this.destroy({
				filters: {
					[Op.or]: [
						{ sourceUserId: userId, targetUserId: friendId },
						{ sourceUserId: friendId, targetUserId: userId },
					],
					actionType: FriendActionType.BLOCKED,
				},
				transaction,
			});
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "unblockFriend" });
		}
	}

	async destroy({ filters, transaction }: { filters: WhereOptions; transaction?: Transaction; }) {
		try {
			await this._model.destroy({ where: filters, transaction });
		} catch (error) {
			throw this._handleError(error as Error, { repo: "FriendActions", method: "destroy" });
		}
	}
}