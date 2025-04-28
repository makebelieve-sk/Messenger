import type { Sequelize, Transaction } from "sequelize";

import Chats from "@core/database/repositories/Chats";
import DisabledChatsSound from "@core/database/repositories/DisabledChatsSound";
import Files from "@core/database/repositories/Files";
import FilesInMessage from "@core/database/repositories/FilesInMessage";
import FriendActions from "@core/database/repositories/FriendActions";
import FriendActionsLog from "@core/database/repositories/FriendActionsLog";
import Messages from "@core/database/repositories/Messages";
import NotificationsSettings from "@core/database/repositories/NotificationsSettings";
import Photos from "@core/database/repositories/Photos";
import PhotosInMessage from "@core/database/repositories/PhotosInMessage";
import UserDetails from "@core/database/repositories/UserDetails";
import UserMessageStatuses from "@core/database/repositories/UserMessageStatuses";
import UserPhotos from "@core/database/repositories/UserPhotos";
import Users from "@core/database/repositories/Users";
import UsersInChat from "@core/database/repositories/UsersInChat";
import { t } from "@service/i18n";
import { RepositoryError } from "@errors/index";
import { HTTPStatuses } from "@custom-types/enums";

// Класс, содержит доступы ко всем таблицам базы данных
export default class Repository {
	private _users: Users;
	private _photos: Photos;
	private _userDetails: UserDetails;
	private _userPhotos: UserPhotos;
	private _notificationsSettings: NotificationsSettings;
	private _friendActions: FriendActions;
	private _friendActionsLog: FriendActionsLog;
	private _chats: Chats;
	private _disabledChatsSound: DisabledChatsSound;
	private _usersInChat: UsersInChat;
	private _messages: Messages;
	private _userMessageStatuses: UserMessageStatuses;
	private _photosInMessage: PhotosInMessage;
	private _files: Files;
	private _filesInMessage: FilesInMessage;

	constructor(private readonly _sequelize: Sequelize) {
		this._users = new Users(this);
		this._photos = new Photos(this);
		this._userDetails = new UserDetails(this._sequelize);
		this._userPhotos = new UserPhotos(this._sequelize);
		this._notificationsSettings = new NotificationsSettings(this._sequelize);
		this._friendActions = new FriendActions(this._sequelize);
		this._friendActionsLog = new FriendActionsLog(this._sequelize);
		this._chats = new Chats(this._sequelize);
		this._disabledChatsSound = new DisabledChatsSound(this._sequelize);
		this._usersInChat = new UsersInChat(this._sequelize);
		this._messages = new Messages(this._sequelize);
		this._userMessageStatuses = new UserMessageStatuses(this._sequelize);
		this._photosInMessage = new PhotosInMessage(this._sequelize);
		this._files = new Files(this._sequelize);
		this._filesInMessage = new FilesInMessage(this._sequelize);
	}

	get sequelize() {
		return this._sequelize;
	}

	get users() {
		return this._users;
	}
	get photos() {
		return this._photos;
	}
	get userDetails() {
		return this._userDetails;
	}
	get userPhotos() {
		return this._userPhotos;
	}
	get notificationsSettings() {
		return this._notificationsSettings;
	}
	get friendActions() {
		return this._friendActions;
	}
	get friendActionsLog() {
		return this._friendActionsLog;
	}
	get chats() {
		return this._chats;
	}
	get disabledChatsSound() {
		return this._disabledChatsSound;
	}
	get usersInChat() {
		return this._usersInChat;
	}
	get messages() {
		return this._messages;
	}
	get userMessageStatuses() {
		return this._userMessageStatuses;
	}
	get photosInMessage() {
		return this._photosInMessage;
	}
	get files() {
		return this._files;
	}
	get filesInMessage() {
		return this._filesInMessage;
	}

	// Общий метод популяции пользователя (то есть по мимо полного объекта пользователя здесь подугружается еще доп. информация и его настройки уведомлений)
	async populateUser({ userId, transaction }: { userId: string; transaction: Transaction; }) {
		try {
			const userDetails = await this._userDetails.findOneBy({
				filters: { userId },
				transaction,
			});

			if (!userDetails) {
				throw new RepositoryError(t("users.error.user_details_not_found"), HTTPStatuses.NotFound);
			}

			const notificationSettings = await this._notificationsSettings.findOneBy({
				filters: { userId },
				transaction,
			});

			if (!notificationSettings) {
				throw new RepositoryError(t("users.error.notifications_settings_not_found"), HTTPStatuses.NotFound);
			}

			return { userDetails, notificationSettings };
		} catch (error) {
			const nextError = error instanceof RepositoryError ? error : new RepositoryError((error as Error).message);

			throw nextError;
		}
	}
}
