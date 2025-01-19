// Методы тестирования
enum TestMethods {
    mount = "mount",
    shallow = "shallow",
    render = "render"
};

// API маршруты
enum ApiRoutes {
    //----auth----------
    signUp = "/sign-up",
    signIn = "/sign-in",
    logout = "/logout",
    //----userInfo------
    getMe = "get-me",
    getUser = "/get-user",
    editInfo = "/edit-info",
    getUserDetail = "/get-user-detail",
    //----images---------
    uploadAvatar = "/upload-avatar",
    saveAvatar = "/save-avatar",
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
    friends = "/friends",
    getFriends = "/get-friends",
    getFriendInfo = "/get-friend-info",
    getCountFriends = "/get-count-friends",
    getPossibleUsers = "/get-possible-users",
    addToFriend = "/add-to-friend",
    unsubscribeUser = "/unsubscribe-user",
    acceptUser = "/accept-user",
    leftInSubscribers = "/left-in-subscribers",
    deleteFriend = "/delete-friend",
    getFriendsNotification = "/get-friends-notification",
    blockFriend = "/block-friend",
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
    getAttachments = "/get-attachments"
};

// Статусы HTTP-запросов
enum HTTPStatuses {
    PermanentRedirect = 308,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    ServerError = 500,
};

// URL страницы
enum Pages {
    notExists = "*",
    main = "/",
    profile = "/profile",
    edit = "/edit",
    messages = "/messages",
    friends = "/friends",
    photos = "/photos",
    calls = "/calls",
    signUp = "/sign-up",
    signIn = "/sign-in",
    resetPassword = "/reset-password",
    error = "/error",
    settings = "/settings",
    help = "/help",
    aboutUs = "/about-us",
};

// Основные вкладки страницы "Друзья"
enum MainFriendTabs {
    allFriends = 0,
    allRequests = 1,
    search = 2,
};

// Вкладки друзей
enum FriendsTab {
    all = 0,
    online = 1,
    subscribers = 2,
    friendRequests = 3,
    incomingRequests = 4,
    search = 5,
};

// SOCKET маршруты
enum SocketActions {
    // ---------------USERS------------------
    GET_ALL_USERS = "GET_ALL_USERS",
    GET_NEW_USER = "GET_NEW_USER",
    USER_DISCONNECT = "USER_DISCONNECT",
    //----------------FRIENDS----------------
    ADD_TO_FRIENDS = "ADD_TO_FRIENDS",
    ACCEPT_FRIEND = "ACCEPT_FRIEND",
    UNSUBSCRIBE = "UNSUBSCRIBE",
    FRIENDS = "FRIENDS",
    BLOCK_FRIEND = "BLOCK_FRIEND",
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
    READ = 1
};

// Используемые времена
enum Times {
    TODAY = 1000 * 60 * 60 * 24,
    YESTERDAY = 1000 * 60 * 60 * 24 * 2,
    HALF_YEAR = 1000 * 60 * 60 * 24 * 30 * 6,
};

// Виды файлов, добавляются в объект сообщения при их обработке
enum FileVarieties {
    IMAGES = "IMAGES",
    FILES = "FILES"
};

enum FriendsNoticeTypes {
    ADD = "add",
    REMOVE = "remove",
    UPDATE = "update"
};

// Типы изображений, передаваемых в компонент Common/Photo.tsx
enum ImgComponentTypes {
    PHOTO = "photo",
    AVATAR = "avatar"
};

// Типы, предназначенные для установки чатов и непрочитанных сообщений в них
enum UnReadTypes {
    ADD_CHAT = "ADD_CHAT",
    ADD_MESSAGE = "ADD_MESSAGE",
    REMOVE_CHAT = "REMOVE_CHAT",
    REMOVE_MESSAGES = "REMOVE_MESSAGES",
    RESET = "RESET"
};

// Список возможных кодов ошибок по API
enum ErrorCodes {
    ERR_NETWORK = "ERR_NETWORK",
    ERR_TIMEOUT = "ERR_TIMEOUT",
    ERR_BAD_REQUEST = "ERR_BAD_REQUEST",
    ERR_CANCELED = "ERR_CANCELED"
};

export {
    TestMethods,
    ApiRoutes,
    HTTPStatuses,
    Pages,
    MainFriendTabs,
    FriendsTab,
    SocketActions,
    MessageTypes,
    MessageReadStatus,
    Times,
    FileVarieties,
    FriendsNoticeTypes,
    ImgComponentTypes,
    UnReadTypes,
    ErrorCodes,
};