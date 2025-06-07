/**
 * Список ассоциаций, используемых в проекте.
 * Их необходимо использовать только для корректного указания алиаса таблицы.
 * В большинстве случаев, Sequelize автоматически настраивает алиасы для таблиц, исходя из их наименования.
 * Но, бывают случаи, когда у нас может быть несколько ассоциаций между одними и теми жи таблицами.
 * Например, мы имеем два разных типа связи между таблицами Users и Photos:
 * 1) один ко многим: необходимо указать свои алиасы и использовать их в "include"
 * 2) многие ко многим через связную таблицу UserPhotos: также необходимо указать алиасы для 
 * использования в "include"
 */
export default {
	USER_WITH_AVATAR: "UserWithAvatar",
	AVATAR_WITH_USER: "AvatarWithUser",
	AVATAR_WITH_CHAT: "AvatarWithChat",
	CHAT_WITH_AVATAR: "ChatWithAvatar",

	SENT_FRIEND_REQUESTS: "SentFriendRequestsLog",
	RECEIVED_FRIEND_REQUESTS: "ReceivedFriendRequestsLog",
	SOURCE_USER: "SourceUser",
	TARGET_USER: "TargetUser",
    
	USER_WITH_MESSAGE: "UserWithMessage",
	MESSAGE_WITH_USER: "MessageWithUser",

	USER_WITH_PHOTOS: "UserWithPhotos",
	PHOTOS_WITH_USER: "PhotosWithUser",

	USERS_WITH_DISABLED_CHATS_SOUND: "UsersWithDisabledChatsSound",
	CHATS_DISABLED_SOUND_WITH_USERS: "ChatsDisabledSoundWithUsers",

	USERS_WITH_CHATS: "UsersWithChats",
	CHATS_WITH_USERS: "ChatsWithUsers",

	USERS_WITH_MESSAGES_STATUSES: "UsersWithMessagesStatuses",
	MESSAGES_STATUSES_WITH_USERS: "MessagesStatusesWithUsers",
} as const;