// Методы тестирования
export enum TestMethods {
	mount = "mount",
	shallow = "shallow",
	render = "render",
};

// URL страницы
export enum Pages {
	notExists = "*",
	main = "/",
	profile = "/profile",
	profileUser = "/profile/:userId?",
	edit = "/edit",
	messages = "/messages",
	friends = "/friends",
	photos = "/photos",
	photosUser = "/photos/:userId?",
	calls = "/calls",
	signUp = "/sign-up",
	signIn = "/sign-in",
	resetPassword = "/reset-password",
	error = "/error",
	help = "/help",
	aboutUs = "/about-us",
};

// Основные вкладки страницы "Друзья"
export enum MainFriendTabs {
	allFriends = 0,
	allRequests = 1,
	search = 2,
};

// Вкладки страницы редактирования
export enum EditTabs {
	MAIN = 0,
	CONTACTS = 1,
};

// Используемые времена
export enum Times {
	TODAY = 1000 * 60 * 60 * 24,
	YESTERDAY = 1000 * 60 * 60 * 24 * 2,
	HALF_YEAR = 1000 * 60 * 60 * 24 * 30 * 6,
};

export enum FriendsNoticeTypes {
	ADD = "add",
	REMOVE = "remove",
	UPDATE = "update",
};

// Типы изображений, передаваемых в компонент Common/Photo.tsx
export enum ImgComponentTypes {
	PHOTO = "photo",
	AVATAR = "avatar",
};

// Типы, предназначенные для установки чатов и непрочитанных сообщений в них
export enum UnReadTypes {
	ADD_CHAT = "ADD_CHAT",
	ADD_MESSAGE = "ADD_MESSAGE",
	REMOVE_CHAT = "REMOVE_CHAT",
	REMOVE_MESSAGES = "REMOVE_MESSAGES",
	RESET = "RESET",
};

// Список возможных кодов ошибок по API
export enum ErrorCodes {
	ERR_NETWORK = "ERR_NETWORK",
	ERR_TIMEOUT = "ERR_TIMEOUT",
	ERR_BAD_REQUEST = "ERR_BAD_REQUEST",
	ERR_CANCELED = "ERR_CANCELED",
};

export enum DebuggerType {
	DEBUG = "",
	INFO = "INFO",
	WARN = "WARN",
	ERROR = "ERROR",
};

export enum ThemeTypes {
	LIGHT = "light",
	DARK = "dark",
};