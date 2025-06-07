// Каналы Redis
export enum RedisChannel {
	TEMP_CHAT_ID = "TEMP_CHAT_ID",
};

// Список ключей редиса
export enum RedisKeys {
	SESS = "sess",
	REMEMBER_ME = "rememberMe",
};

// Типы действий пользователей в разделе "Друзья"
export enum FriendActionType {
	FOLLOWING = 0,
	FRIEND = 1,
	BLOCKED = 2,
	LEFT_IN_FOLLOWERS = 3,
};