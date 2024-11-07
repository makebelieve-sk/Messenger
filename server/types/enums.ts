// API маршруты
enum ApiRoutes {
    //----auth----------
    signUp = "/sign-up",
    signIn = "/sign-in",
    logout = "/logout",
    //----userInfo------
    getMe = "/get-me",
    getUser = "/get-user",
    editInfo = "/edit-info",
    getUserDetail = "/get-user-detail",
    getPhotos = "/get-photos",
    //----file-----------
    saveAvatar = "/save-avatar",
    uploadAvatar = "/upload-avatar",
    uploadAvatarAuth = "/upload-avatar-auth",
    saveFiles = "/save-files",
    openFile = "/open-file",
    downloadFile = "/download-file",
    savePhotos = "/save-photos",
    deleteImage = "/delete-image",
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
    getAttachments = "/get-attachments",
    //------calls---------
    endCall = "/end-call",
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
    // --------------CALLS-------------------
    CALL = "CALL",
    NOTIFY_CALL = "NOTIFY_CALL",
    ACCEPT_CALL = "ACCEPT_CALL",
    CHANGE_CALL_STATUS = "CHANGE_CALL_STATUS",
    SET_CALL_STATUS = "SET_CALL_STATUS",
    END_CALL = "END_CALL",
    CHANGE_STREAM = "CHANGE_STREAM",
    CANCEL_CALL = "CANCEL_CALL",
    ALREADY_IN_CALL = "ALREADY_IN_CALL",
    NOT_ALREADY_IN_CALL = "NOT_ALREADY_IN_CALL",
    IS_TALKING = "IS_TALKING",
    // --------------WEBRTC------------------
    ADD_PEER = "ADD_PEER",
    TRANSFER_CANDIDATE = "TRANSFER_CANDIDATE",
    TRANSFER_OFFER = "TRANSFER_OFFER",
    SESSION_DESCRIPTION = "SESSION_DESCRIPTION",
    GET_CANDIDATE = "GET_CANDIDATE",
    REMOVE_PEER = "REMOVE_PEER",
    //-----------------SYSTEM---------------
    SOCKET_CHANNEL_ERROR = "SOCKET_CHANNEL_ERROR",
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

// Каналы Redis
enum RedisChannel {
    TEMP_CHAT_ID = "TEMP_CHAT_ID",
};

// Общие сообщения с ошибкой
enum ErrorTexts {
    NOT_TEMP_CHAT_ID = "id собеседника не найдено, возможно, это временный чат",
};

// Статусы звонков
enum CallStatus {
    NOT_CALL = "NOT_CALL",
    SET_CONNECTION = "SET_CONNECTION",
    WAIT = "WAIT",
    NEW_CALL = "NEW_CALL",
    ACCEPT = "ACCEPT",
    REJECTED = "REJECTED",
    OFFLINE = "OFFLINE",
};

// Разновидность звонков
enum SettingType {
    VIDEO = "VIDEO",
    AUDIO = "AUDIO"
};

// Типы ошибочных каналов сокета
enum SocketChannelErrorTypes {
    CALLS = "CALLS",
};

// Типы звонков
enum CallTypes {
    SINGLE = 0,
    GROUP = 1,
    SEPARATE = 2,
};

// Наименования звонков
enum CallNames {
    OUTGOING = "Исходящий звонок",
    INCOMING = "Входящий звонок",
    GROUP = "Групповой звонок",
    CANCEL = "Звонок отменён"
};

// Виды файлов, добавляются в объект сообщения при их обработке
enum FileVarieties {
    IMAGES = "IMAGES",
    FILES = "FILES"
};

// Типы сообщений об ошибке, отправляемые с сервера на фронт по АПИ
enum ErrorTextsApi {
    NOT_AUTH_OR_TOKEN_EXPIRED = "Вы не авторизованы или время жизни токена сессии подошло к концу",
    CANNOT_FIND_CALL = "Невозможно завершить звонок, так как он не найден. Возможно, он уже завершен.",
    YOU_ALREADY_AUTH = "Вы уже авторизированы",
    USER_NOT_FOUND = "Пользователь не найден",
    IMAGE_NOT_FOUND = "Изображение не найдено",
    FILE_NOT_FOUND = "Файл не найден",
    USER_NOT_FOUND_IN_DATABASE = "Запись пользователя в таблице не найдена",
    IMAGE_NOT_GIVEN = "В req.file не передано изображение",
};

// Список ключей редиса
enum RedisKeys {
    SESSION = "sess",
    REMEMBER_ME = "rememberMe"
};

export {
    ApiRoutes,
    HTTPStatuses,
    SocketActions,
    FriendsTab,
    MessageTypes,
    MessageReadStatus,
    RedisChannel,
    ErrorTexts,
    CallStatus,
    SettingType,
    SocketChannelErrorTypes,
    CallTypes,
    CallNames,
    FileVarieties,
    ErrorTextsApi,
    RedisKeys,
};