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

// Типы сообщений об ошибке
enum ErrorTextsApi {
    // ошибки авторизации и аутентификации
    INCORRECT_LOGIN_OR_PASSWORD = "Не верно указан логин или пароль",
    NOT_AUTH_OR_TOKEN_EXPIRED = "Вы не авторизованы или время жизни токена сессии подошло к концу",
    YOU_ALREADY_AUTH = "Вы уже авторизированы",
    ERROR_CREATING_USER_DETAILS = "Пользователь не создался в базе данных в таблице UserDetails",
    ERROR_CREATING_USER = "Пользователь не создался в базе данных в таблице Users",
    SESSION_ID_NOT_EXISTS = "Уникальный идентификатор сессии не существует",

    // ошибки файлов, фотографий, аватаров
    SHARP_AVATAR_PATH_NOT_FOUND = "Не передан путь к сжатому файлу с аватаром",
    SHARP_PHOTO_PATH_NOT_FOUND =  "Не передан путь к сжатому файлу с фотографией",
    SHARP_PHOTO_PATHS_NOT_FOUND = "Сжатые фотографии не найдены",
    DELETE_PHOTO_PATH_NOT_FOUND = "Не передан путь для удаления фотографии",
    PHOTO_NOT_FOUND = "Фотография не найдена",
    FILES_NOT_FOUND = "Не переданы файлы",
    FILE_PATH_OPEN_NOT_FOUND = "Не передан путь для открытия файла",
    FILE_PATH_DOWNLOAD_NOT_FOUND = "Не передан путь для скачивания файла",
    FILE_NOT_FOUND = "Файл не найден",

    // ошибки в друзьях
    NOT_CORRECT_ANSER_GET_FRIENDS_NOTIFICATIONS = "Запрос выполнился некорректно и ничего не вернул (getFriendsNotification)",
    NOT_CORRECT_ANSER_POSSIBLE_USERS = "Запрос выполнился некорректно и ничего не вернул (possibleUsers)",
    NOT_CORRECT_ANSER_GET_FRIENDS_TAB_0 = "Запрос выполнился некорректно и ничего не вернул (tab=0)",
    NOT_CORRECT_ANSER_GET_FRIENDS_TAB_1 = "Список пользователей на сервере пуст (tab=1)",
    NOT_CORRECT_ANSER_GET_FRIENDS_TAB_2 = "Запрос выполнился некорректно и ничего не вернул (tab=2)",
    NOT_CORRECT_ANSER_GET_FRIENDS_TAB_3 = "Запрос выполнился некорректно и ничего не вернул (tab=3)",
    NOT_CORRECT_ANSER_GET_FRIENDS_TAB_4 = "Запрос выполнился некорректно и ничего не вернул (tab=4)",
    NOT_CORRECT_ANSER_GET_FRIENDS_TAB_5 = "Запрос выполнился некорректно и ничего не вернул (tab=5)",
    UNKNOWN_TAB = "Тип вкладки не распознан",
    NOT_TEMPORAL_CHAT_ID = "Идентификатор собеседника не найден, возможно, это временный чат",
    SUBSCRIBED_ID_NOT_FOUND = "Не передан идентификатор добавляемого пользователя",
    UNSUBSCRIBED_ID_NOT_FOUND = "Не передан идентификатор отписываемого пользователя",
    ADD_TO_FRIEND_ID_NOT_FOUND = "Не передан идентификатор принимаемого пользователя",
    LEFT_TO_SUBSCRIBED_ID_NOT_FOUND = "Не передан идентификатор подписанного пользователя",
    DELETED_ID_NOT_FOUND = "Не передан идентификатор удаляемого пользователя",
    BLOCKED_ID_NOT_FOUND = "Не передан идентификатор блокируемого пользователя",
    CHECK_BLOCKED_ID_NOT_FOUND = "Не передан id проверяемого пользователя",

    // ошибки при управлении пользователями
    USER_NOT_FOUND = "Пользователь не найден",
    USER_NOT_FOUND_IN_DATABASE = "Запись пользователя в базе данных не найдена",
    USER_ID_NOT_FOUND = "id пользователя не передано",

    // ошибки в сообщениях
    NOT_CORRECT_ANSER_GET_DIALOGS = "Запрос выполнился некорректно и ничего не вернул (getDialogs/unReadMessagesCount)",
    CHAT_ID_NOT_FOUND = "Не передан уникальный идентификатор чата",
    USER_ID_IN_MESSAGE_NOT_FOUND = "Не передан Ваш уникальный идентификатор в объекте сообщения",
    CHAT_ID_IN_MESSAGE_NOT_FOUND = "Не передан уникальный идентификатор чата в объекте сообщения",
    MESSAGE_ID_NOT_FOUND = "Не передан уникальный идентификатор сообщения",
    MESSAGE_CAN_NOT_BE_EMPTY_WITHOUT_FILES = "Ошибка при изменении сообщения, оно не может быть пустым без прикрепленных файлов.",
    CHAT_PARTNER_ID_NOT_FOUND = "Не передан уникальный идентификатор собеседника",
    CHAT_PARTNER_NOT_FOUND = "Собеседник чата не найден",
    DELETED_MESSAGE_ID_NOT_FOUND = "Не передан уникальный идентификатор удаляемого сообщения",
    YOUR_ALREADY_DELETE_THIS_MESSAGE = "Данное сообщение уже было Вами удалено",
    DELETED_CHAT_ID_NOT_FOUND = "Не передан уникальный идентификатор удаляемого приватного чата",

    // ошибки в мидлварах
    PHOTO_NOT_GIVEN = "В объекте запроса изображение не найдено",
    PHOTOS_NOT_FOUND = "Не переданы изображения для сжатия",

    // ошибка в сокет соединении
    USER_ID_NOT_GIVEN = "Не передан идентификатор пользователя",
    INCORRECT_TYPE_IN_FRIENDS = "Некорректный тип при действиях в друзьях",
    CANNOT_FIND_CALL = "Невозможно завершить звонок, так как он не найден. Возможно, он уже завершен",

    // ошибки базы данных
    ERROR_IN_CLOSE_DB = "Закрытие соединения с базой данных завершилось не удачно",
    ERROR_IN_CONNECT_DB = "Соединение с базой данных завершилось с ошибкой",

    // ошибки в Redis
    ERROR_IN_CLIENT_CONNECT = "Соединение с базой данных Redis завершилось не удачно: ",
    ERROR_IN_CLIENT_WORK = "Ошибка в работе клиента Redis: ",

    // ошибки глобальные
    START_SERVER_ERROR = "Возникла ошибка при запуске экземпляра сервера",
    UNHANDLED_SYNC_ERROR = "Не обработанная ошибка в синхронном коде",
    UNHANDLED_ASYNC_ERROR = "Не обработанная ошибка в асинхронном коде",
};

// Список ключей редиса
enum RedisKeys {
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
    CallStatus,
    SettingType,
    SocketChannelErrorTypes,
    CallTypes,
    CallNames,
    FileVarieties,
    ErrorTextsApi,
    RedisKeys,
};