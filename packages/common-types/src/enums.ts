// API маршруты
enum ApiRoutes {
	//----main-----------
	apiDocs = "/api-docs",
	checkHealth = "/check-health",
	soundNotifications = "/sound-notifications",
	deleteAccount = "/delete-account",
	//----auth-----------
	signUp = "/sign-up",
	signIn = "/sign-in",
	logout = "/logout",
	//----userInfo-------
	getMe = "/get-me",
	getUser = "/get-user",
	editInfo = "/edit-info",
	//----images---------
	uploadAvatar = "/upload-avatar",
	changeAvatar = "/change-avatar",
	getPhotos = "/get-photos",
	savePhotos = "/save-photos",
	deletePhoto = "/delete-photo",
	//----file-----------
	saveFiles = "/save-files",
	openFile = "/open-file",
	downloadFile = "/download-file",
	deleteFiles = "/delete-files",
	//----friends--------
	getAllCounts = "/get-all-counts",
	getMyFriends = "/get-my-friends",
	checkOnlineUser = "/check-online-user",
	getFollowers = "/get-followers",
	getBlockedFriends = "/get-blocked-friends",
	getCommonFriends = "/get-common-friends",
	getFriendInfo = "/get-friend-info",
	getPossibleFriends = "/get-possible-friends",
	followFriend = "/follow-friend",
	getIncomingRequests = "/get-incoming-requests",
	getOutgoingRequests = "/get-outgoing-requests",
	unfollow = "/unfollow",
	addFriend = "/add-friend",
	leftInFollowers = "/left-in-followers",
	acceptFriendRequest = "/accept-friend-request",
	deleteFriend = "/delete-friend",
	getFriendsNotification = "/get-friends-notification",
	blockFriend = "/block-friend",
	unblockFriend = "/unblock-friend",
	checkBlockStatus = "/check-block-status",
	//----messages--------
	getDialogs = "/get-dialogs",
	deleteChat = "/delete-chat",
	getMessages = "/get-messages",
	saveMessage = "/save-message",
	updateMessage = "/update-message",
	deleteMessage = "/delete-message",
	readMessage = "/read-message",
	getChatId = "/get-chat-id",
	getMessageNotification = "/get-message-notification",
	getChatInfo = "/get-chat-info",
	getUsersInChat = "/get-users-in-chat",
	getLastSeen = "/get-last-seen",
	getChatSoundStatus = "/get-chat-sound-status",
	setChatSoundStatus = "/set-chat-sound-status",
};

// Статусы HTTP-запросов
enum HTTPStatuses {
	OK = 200,
	Created = 201,
	NoContent = 204,
	PermanentRedirect = 308,
	BadRequest = 400,
	Unauthorized = 401,
	Forbidden = 403,
	NotFound = 404,
	Conflict = 409,
	PayloadTooLarge = 413,
	TooManyRequests = 429,
	ServerError = 500,
	ServiceUnavailable = 503,
};

// Типы, которые описывают на какой странице возникла ошибка для её корректной отправки через шину событий на клиенте
enum HTTPErrorTypes {
	SIGN_UP = 1,
	SIGN_IN = 2,
	EDIT_INFO = 3,
};

// SOCKET маршруты
enum SocketActions {
	// ---------------USERS------------------
	GET_ALL_USERS = "GET_ALL_USERS",
	GET_NEW_USER = "GET_NEW_USER",
	USER_DISCONNECT = "USER_DISCONNECT",
	LOG_OUT = "LOG_OUT",
	//----------------FRIENDS----------------
	ACCEPT_FRIEND = "ACCEPT_FRIEND",
	FOLLOW_FRIEND = "FOLLOW_FRIEND",
	ADD_OUTGOING_REQUEST = "ADD_OUTGOING_REQUEST",
	UNFOLLOW_FRIEND = "UNFOLLOW_FRIEND",
	REMOVE_OUTGOING_REQUEST = "REMOVE_OUTGOING_REQUEST",
	ADD_TO_FRIEND = "ADD_TO_FRIEND",
	REMOVE_FOLLOWER = "REMOVE_FOLLOWER",
	ADD_FRIEND_REQUEST = "ADD_FRIEND_REQUEST",
	REMOVE_FRIEND_REQUEST = "REMOVE_FRIEND_REQUEST",
	REJECT_FRIEND_REQUEST = "REJECT_FRIEND_REQUEST",
	ADD_TO_FOLLOWER = "ADD_TO_FOLLOWER",
	DELETE_FRIEND = "DELETE_FRIEND",
	DELETING_FRIEND = "DELETING_FRIEND",
	BLOCK_FRIEND = "BLOCK_FRIEND",
	BLOCKING_FRIEND = "BLOCKING_FRIEND",
	UNBLOCK_FRIEND = "UNBLOCK_FRIEND",
	UNBLOCKING_FRIEND = "UNBLOCKING_FRIEND",
	// ---------------MESSAGES---------------
	MESSAGE = "MESSAGE",
	SEND_MESSAGE = "SEND_MESSAGE",
	EDIT_MESSAGE = "EDIT_MESSAGE",
	SET_TEMP_CHAT = "SET_TEMP_CHAT",
	GET_NEW_MESSAGE_ON_SERVER = "GET_NEW_MESSAGE_ON_SERVER",
	ADD_NEW_MESSAGE = "ADD_NEW_MESSAGE",
	NOTIFY_WRITE = "NOTIFY_WRITE",
	CHANGE_READ_STATUS = "CHANGE_READ_STATUS",
	ACCEPT_CHANGE_READ_STATUS = "ACCEPT_CHANGE_READ_STATUS",
	DELETE_MESSAGE = "DELETE_MESSAGE",
	DELETE_CHAT = "DELETE_CHAT",
	//-----------------SYSTEM---------------
	SOCKET_CHANNEL_ERROR = "SOCKET_CHANNEL_ERROR",
};

// Вкладки друзей
enum FriendsTab {
	ALL = 0,
	MY = 1,
	ONLINE = 2,
	FOLLOWERS = 3,
	OUTGOING_REQUESTS = 4,
	INCOMING_REQUESTS = 5,
	SEARCH = 6,
	BLOCKED = 7,
	COMMON = 8,
};

// Типы сообщений
enum MessageTypes {
	MESSAGE = 1,
	WITH_FILE = 2,
	VOICE = 3,
	CALL = 4,
	FEW_FILES = 5,
};

// Типы прочитанных сообщений
enum MessageReadStatus {
	NOT_READ = 0,
	READ = 1,
};

// Виды файлов, добавляются в объект сообщения при их обработке
enum FileVarieties {
	IMAGES = "IMAGES",
	FILES = "FILES",
};

export {
	ApiRoutes,
	HTTPStatuses,
	HTTPErrorTypes,
	SocketActions,
	FriendsTab,
	MessageTypes,
	MessageReadStatus,
	FileVarieties,
};