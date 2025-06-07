import { ApiRoutes, HTTPStatuses, SocketActions } from "common-types";
import type { Express, NextFunction, Request, Response } from "express";
import type Transaction from "sequelize/lib/transaction";

import type Middleware from "@core/api/Middleware";
import type UsersController from "@core/controllers/UsersController";
import type Database from "@core/database/Database";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { FriendsError } from "@errors/controllers";
import { type ServerToClientEvents } from "@custom-types/socket.types";
import { type ISafeUser } from "@custom-types/user.types";

const logger = Logger("FriendsController");

interface IFriendsData {
	ids?: string[];
	userId?: string;
	limit: number;
	lastCreatedAt?: string;
	search?: string;
};

interface ISendSocket {
	user: ISafeUser;
	friendId: string;
	payload?: Record<string, { userId: string; }>;
	socketActions: Record<string, keyof ServerToClientEvents>;
}

// Класс, отвечающий за API друзей
export default class FriendsController {
	constructor(
		private readonly _app: Express,
		private readonly _middleware: Middleware,
		private readonly _database: Database,
		private readonly _users: UsersController,
	) {
		this._init();
	}

	// Слушатели запросов контроллера FriendsController
	private _init() {
		this._app.get(ApiRoutes.getFriendsNotification, this._middleware.mustAuthenticated.bind(this._middleware), this._getFriendsNotification.bind(this));
		// this._app.post(ApiRoutes.getFriendInfo, this._middleware.mustAuthenticated.bind(this._middleware), this._getFriendInfo.bind(this));
		this._app.post(ApiRoutes.getAllCounts, this._middleware.mustAuthenticated.bind(this._middleware), this._getAllCounts.bind(this));
		this._app.post(ApiRoutes.getPossibleFriends, this._middleware.mustAuthenticated.bind(this._middleware), this._getPossibleFriends.bind(this));
		this._app.post(ApiRoutes.getMyFriends, this._middleware.mustAuthenticated.bind(this._middleware), this._getMyFriends.bind(this));
		this._app.post(ApiRoutes.checkOnlineUser, this._middleware.mustAuthenticated.bind(this._middleware), this._checkOnlineUser.bind(this));
		this._app.post(ApiRoutes.getFollowers, this._middleware.mustAuthenticated.bind(this._middleware), this._getFollowers.bind(this));
		this._app.post(ApiRoutes.getBlockedFriends, this._middleware.mustAuthenticated.bind(this._middleware), this._getBlockedFriends.bind(this));
		this._app.post(ApiRoutes.getCommonFriends, this._middleware.mustAuthenticated.bind(this._middleware), this._getCommonFriends.bind(this));
		this._app.post(ApiRoutes.getIncomingRequests, this._middleware.mustAuthenticated.bind(this._middleware), this._getIncomingRequests.bind(this));
		this._app.post(ApiRoutes.getOutgoingRequests, this._middleware.mustAuthenticated.bind(this._middleware), this._getOutgoingRequests.bind(this));
		this._app.post(ApiRoutes.followFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._followFriend.bind(this));
		this._app.post(ApiRoutes.unfollow, this._middleware.mustAuthenticated.bind(this._middleware), this._unfollow.bind(this));
		this._app.post(ApiRoutes.addFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._addFriend.bind(this));
		this._app.post(ApiRoutes.acceptFriendRequest, this._middleware.mustAuthenticated.bind(this._middleware), this._acceptFriendRequest.bind(this));
		this._app.post(ApiRoutes.leftInFollowers, this._middleware.mustAuthenticated.bind(this._middleware), this._leftInFollowers.bind(this));
		this._app.post(ApiRoutes.deleteFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._deleteFriend.bind(this));
		this._app.post(ApiRoutes.blockFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._blockFriend.bind(this));
		this._app.post(ApiRoutes.unblockFriend, this._middleware.mustAuthenticated.bind(this._middleware), this._unblockFriend.bind(this));
		// this._app.post(ApiRoutes.checkBlockStatus, this._middleware.mustAuthenticated.bind(this._middleware), this._checkBlockStatus.bind(this));
	}

	// Отправка события по сокет-соединению
	private async _sendSocketEvent({ user, friendId, payload, socketActions }: ISendSocket) {
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
	private async _getFriendsNotification(req: Request, res: Response, next: NextFunction) {
		try {
			const userId = req.user.id;

			logger.debug("_getFriendsNotification [userId=%s]", userId);

			const friendsNotification = await this._database.repo.friendActions.getFriendsNotification({ data: { userId } });

			res.status(HTTPStatuses.OK).json({ success: true, friendsNotification });
		} catch (error) {
			next(error);
		}
	}

	// Получить общее количество всех друзей на всех вкладках для первого входа (в независимости от страницы профиля или друзей)
	private async _getAllCounts(req: Request, res: Response, next: NextFunction) {
		logger.debug("_getAllCounts [req.body=%j]", req.body);

		try {
			const { userId: anotherUserId }: { userId: string; } = req.body;
			const userId = req.user.id;

			const allCounts = await this._database.repo.friendActions.getAllCounts({ data: { userId, anotherUserId } });

			res.status(HTTPStatuses.OK).json({ success: true, ...allCounts });
		} catch (error) {
			next(error);
		}
	}

	// Получение списка возможных друзей текущего пользователя
	private async _getPossibleFriends(req: Request, res: Response, next: NextFunction) {
		logger.debug("_getPossibleFriends [req.body=%j]", req.body);

		try {
			const userId = req.user.id;

			const { limit, page = 0, search = "" }: { limit: number; page?: number; search?: string; } = req.body;

			const possibleFriendsData = await this._database.repo.friendActions.getPossibleFriends({ data: { userId, limit, page, search } });

			res.status(HTTPStatuses.OK).json({ success: true, ...possibleFriendsData });
		} catch (error) {
			next(error);
		}
	}

	// Получение списка друзей текущего пользователя
	private async _getMyFriends(req: Request, res: Response, next: NextFunction) {
		logger.debug("_getMyFriends [req.body=%j]", req.body);

		try {
			const { userId: anotherUserId, limit, lastCreatedAt = "", search = "" }: IFriendsData = req.body;
			const userId = anotherUserId || req.user.id;

			const myFriendsData = await this._database.repo.friendActions.getMyFriends({ data: { userId, limit, lastCreatedAt, search } });

			res.status(HTTPStatuses.OK).json({ success: true, ...myFriendsData });
		} catch (error) {
			next(error);
		}
	}

	// Получение списка онлайн друзей текущего пользователя
	private async _checkOnlineUser(req: Request, res: Response, next: NextFunction) {
		logger.debug("_checkOnlineUser [req.body=%j]", req.body);

		try {
			const { ids = [], search = "" }: IFriendsData = req.body;
			const userId = req.user.id;

			const onlineFriendsData = await this._database.repo.friendActions.getOnlineUsers({ data: { ids, userId, search } });

			res.status(HTTPStatuses.OK).json({ success: true, ...onlineFriendsData });
		} catch (error) {
			next(error);
		}
	}

	// Получение списка подписчиков
	private async _getFollowers(req: Request, res: Response, next: NextFunction) {
		logger.debug("_getFollowers [req.body=%j]", req.body);

		try {
			const { userId: anotherUserId, limit, lastCreatedAt = "", search = "" }: IFriendsData = req.body;
			const userId = anotherUserId || req.user.id;

			const followersData = await this._database.repo.friendActions.getFollowers({ data: { userId, limit, lastCreatedAt, search } });

			res.status(HTTPStatuses.OK).json({ success: true, ...followersData });
		} catch (error) {
			next(error);
		}
	}

	// Получение списка заблокированных пользователей
	private async _getBlockedFriends(req: Request, res: Response, next: NextFunction) {
		logger.debug("_getBlockedFriends [req.body=%j]", req.body);

		try {
			const { limit, lastCreatedAt = "", search = "" }: IFriendsData = req.body;
			const userId = req.user.id;

			const blockedFriendsData = await this._database.repo.friendActions.getBlockedFriends({ data: { userId, limit, lastCreatedAt, search } });

			res.status(HTTPStatuses.OK).json({ success: true, ...blockedFriendsData });
		} catch (error) {
			next(error);
		}
	}

	// Получение списка общих друзей с открытым чужим профилем (используется только для подгрузки в чужом профиле)
	private async _getCommonFriends(req: Request, res: Response, next: NextFunction) {
		logger.debug("_getCommonFriends [req.body=%j]", req.body);

		try {
			const { userId: anotherUserId, limit, lastCreatedAt = "", search = "" }: IFriendsData = req.body;
			const userId = req.user.id;

			if (!anotherUserId) {
				throw new FriendsError(t("friends.error.get_common_friends_id_not_found"), HTTPStatuses.BadRequest);
			}

			const commonFriendsData = await this._database.repo.friendActions.getCommonFriends(
				{ data: { 
					userId, 
					anotherUserId, 
					limit, 
					lastCreatedAt, 
					search, 
				}, 
				});

			res.status(HTTPStatuses.OK).json({ success: true, ...commonFriendsData });
		} catch (error) {
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
	private async _getIncomingRequests(req: Request, res: Response, next: NextFunction) {
		logger.debug("_getIncomingRequests [req.body=%j]", req.body);

		try {
			const userId = req.user.id;

			const { limit, lastCreatedAt = "", search = "" }: IFriendsData = req.body;

			const incomingRequestsData = await this._database.repo.friendActions.getIncomingRequests({ data: { userId, limit, lastCreatedAt, search } });

			res.status(HTTPStatuses.OK).json({ success: true, ...incomingRequestsData });
		} catch (error) {
			next(error);
		}
	}

	// Получить все исходящие запросы дружбы
	private async _getOutgoingRequests(req: Request, res: Response, next: NextFunction) {
		logger.debug("_getOutgoingRequests [req.body=%j]", req.body);

		try {
			const userId = req.user.id;

			const { limit, lastCreatedAt = "", search = "" }: IFriendsData = req.body;

			const outgoingRequestsData = await this._database.repo.friendActions.getOutgoingRequests({ data: { userId, limit, lastCreatedAt, search } });

			res.status(HTTPStatuses.OK).json({ success: true, ...outgoingRequestsData });
		} catch (error) {
			next(error);
		}
	}

	// Добавить пользователя в друзья (подписываемся на него)
	private async _followFriend(req: Request, res: Response, next: NextFunction) {
		logger.debug("_followFriend [req.body=%j]", req.body);

		try {
			const { friendId }: { friendId: string; } = req.body;
			const userId = req.user.id;

			if (!friendId) {
				throw new FriendsError(t("friends.error.subscribed_id_not_found"), HTTPStatuses.BadRequest);
			}

			await this._sendSocketEvent({
				user: req.user,
				friendId,
				socketActions: {
					to: SocketActions.FOLLOW_FRIEND,
					broadcast: SocketActions.ADD_OUTGOING_REQUEST,
				},
			});

			await this._database.repo.friendActions.followFriend({ data: { userId, friendId } });

			res.status(HTTPStatuses.Created).json({ success: true });
		} catch (error) {
			next(error);
		}
	}

	// Отписаться от пользователя
	private async _unfollow(req: Request, res: Response, next: NextFunction) {
		logger.debug("_unfollow [req.body=%j]", req.body);

		try {
			const { friendId }: { friendId: string; } = req.body;
			const userId = req.user.id;

			if (!friendId) {
				throw new FriendsError(t("friends.error.unfollowed_id_not_found"), HTTPStatuses.BadRequest);
			}

			await this._sendSocketEvent({
				user: req.user,
				friendId,
				socketActions: {
					to: SocketActions.UNFOLLOW_FRIEND,
					broadcast: SocketActions.REMOVE_OUTGOING_REQUEST,
				},
			});

			// Удаляем запись - я подписываюсь на добавленного пользователя
			await this._database.repo.friendActions.unfollowFriend({ data: { userId, friendId } });

			res.status(HTTPStatuses.NoContent).end();
		} catch (error) {
			next(error);
		}
	}

	// Добавить пользователя из подписчиков в друзья
	private async _addFriend(req: Request, res: Response, next: NextFunction, { curTransaction }: { curTransaction?: Transaction } = {}) {
		logger.debug("_addFriend [req.body=%j]", req.body);

		const transaction = curTransaction || await this._database.sequelize.transaction();

		try {
			const { friendId }: { friendId: string; } = req.body;
			const userId = req.user.id;

			if (!friendId) {
				throw new FriendsError(t("friends.error.added_id_not_found"), HTTPStatuses.BadRequest);
			}

			await this._sendSocketEvent({
				user: req.user,
				friendId,
				socketActions: {
					to: SocketActions.ADD_TO_FRIEND,
					broadcast: SocketActions.REMOVE_FOLLOWER,
				},
			});

			// Добавляем пользователя в друзья
			await this._database.repo.friendActions.addToFriend({ userId, friendId, transaction });

			await transaction.commit();

			res.status(HTTPStatuses.Created).json({ success: true });
		} catch (error) {
			await transaction.rollback();
			next(error);
		}
	}

	// Принятие запроса дружбы
	private async _acceptFriendRequest(req: Request, res: Response, next: NextFunction) {
		logger.debug("_acceptFriendRequest [req.body=%j]", req.body);

		try {
			const { friendId }: { friendId: string; } = req.body;
			const userId = req.user.id;

			if (!friendId) {
				throw new FriendsError(t("friends.error.accept_friend_not_found"), HTTPStatuses.BadRequest);
			}

			await this._sendSocketEvent({
				user: req.user,
				friendId,
				socketActions: {
					to: SocketActions.ADD_FRIEND_REQUEST,
					broadcast: SocketActions.REMOVE_FRIEND_REQUEST,
				},
			});

			await this._database.repo.friendActions.acceptFriendRequest({ data: { userId, friendId } });

			res.status(HTTPStatuses.NoContent).end();
		} catch (error) {
			next(error);
		}
	}

	// Оставить пользователя в подписчиках (отклонить запрос на дружбу)
	private async _leftInFollowers(req: Request, res: Response, next: NextFunction) {
		logger.debug("_leftInFollowers [req.body=%j]", req.body);

		try {
			const { friendId }: { friendId: string; } = req.body;
			const userId = req.user.id;

			if (!friendId) {
				throw new FriendsError(t("friends.error.left_to_subscribed_id_not_found"), HTTPStatuses.BadRequest);
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
					to: SocketActions.REJECT_FRIEND_REQUEST,
					broadcast: SocketActions.ADD_TO_FOLLOWER,
				},
			});

			await this._database.repo.friendActions.leftInFollowers({ data: { userId, friendId } });

			res.status(HTTPStatuses.NoContent).end();
		} catch (error) {
			next(error);
		}
	}

	// Удалить из друзей
	private async _deleteFriend(req: Request, res: Response, next: NextFunction) {
		logger.debug("_deleteFriend [req.body=%j]", req.body);

		try {
			const { friendId }: { friendId: string; } = req.body;
			const userId = req.user.id;

			if (!friendId) {
				throw new FriendsError(t("friends.error.deleted_id_not_found"), HTTPStatuses.BadRequest);
			}

			await this._sendSocketEvent({
				user: req.user,
				friendId,
				socketActions: {
					to: SocketActions.DELETE_FRIEND,
					broadcast: SocketActions.DELETING_FRIEND,
				},
			});

			await this._database.repo.friendActions.deleteFriend({ data: { userId, friendId } });

			res.status(HTTPStatuses.OK).json({ success: true });
		} catch (error) {
			next(error);
		}
	}

	// Заблокировать пользователя
	private async _blockFriend(req: Request, res: Response, next: NextFunction) {
		logger.debug("_blockFriend [req.body=%j]", req.body);

		try {
			const { friendId }: { friendId: string; } = req.body;
			const userId = req.user.id;

			if (!friendId) {
				throw new FriendsError(t("friends.error.blocked_id_not_found"), HTTPStatuses.BadRequest);
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
					to: SocketActions.BLOCK_FRIEND,
					broadcast: SocketActions.BLOCKING_FRIEND,
				},
			});

			await this._database.repo.friendActions.blockFriend({ data: { userId, friendId } });

			res.status(HTTPStatuses.NoContent).end();
		} catch (error) {
			next(error);
		}
	}

	// Разблокировать пользователя
	private async _unblockFriend(req: Request, res: Response, next: NextFunction) {
		logger.debug("_unblockFriend [req.body=%j]", req.body);

		try {
			const { friendId }: { friendId: string; } = req.body;
			const userId = req.user.id;

			if (!friendId) {
				throw new FriendsError(t("friends.error.unblocked_id_not_found"), HTTPStatuses.BadRequest);
			}

			await this._sendSocketEvent({
				user: req.user,
				friendId,
				socketActions: {
					to: SocketActions.UNBLOCK_FRIEND,
					broadcast: SocketActions.UNBLOCKING_FRIEND,
				},
			});

			await this._database.repo.friendActions.unblockFriend({ data: { userId, friendId } });

			res.status(HTTPStatuses.OK).json({ success: true });
		} catch (error) {
			next(error);
		}
	}

	// // Проверка на блокировку пользователя
	// private async _checkBlockStatus(req: Request, res: Response, next: NextFunction) {
	// 	logger.debug("_checkBlockStatus  [req.body=%j]", req.body);

	// 	const transaction: Transaction = await this._database.sequelize.transaction();

	// 	try {
	// 		const { checkingUser }: { checkingUser: string } = req.body;
	// 		const userId = req.user.id;

	// 		if (!checkingUser) {
	// 			await transaction.rollback();
	// 			return next(new FriendsError(t("friends.error.check_blocked_id_not_found"), HTTPStatuses.BadRequest));
	// 		}

	// 		// Проверяем, заблокировали ли мы такого пользователя
	// 		const isBlockedByMe = await this._database.models.blockUsers.findOne({
	// 			where: { userId, userBlocked: checkingUser },
	// 			transaction,
	// 		});

	// 		// Проверяем, заблокировал ли меня такой пользователь
	// 		const meIsBlocked = await this._database.models.blockUsers.findOne({
	// 			where: { userId: checkingUser, userBlocked: userId },
	// 			transaction,
	// 		});

	// 		await transaction.commit();

	// 		res.json({ success: true, isBlockedByMe, meIsBlocked });
	// 	} catch (error) {
	// 		await transaction.rollback();
	// 		next(error);
	// 	}
	// }
};