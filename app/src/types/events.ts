// Список событий, отправляемых в рамках ядра бизнес-логики
enum MainClientEvents {
    REDIRECT = "redirect",
    GET_ME = "get-me",
    ERROR = "error",
    SIGN_IN = "sign-in",
    LOG_OUT = "logout",
};

// Список событий, отправляемых в рамках работы сокет-соединения
enum SocketEvents {
    RECONNECT = "reconnect"
};

// Список событий, отправляемых в рамках сущности "Пользователь"
enum UserEvents {
    CHANGE_FIELD = "change-field",
    SET_LOADING = "set-loading",
};

// Список событий, отправляемых в рамках сущности "Профиль"
enum ProfileEvents {
    SET_ALERT = "set-alert"
}

// Список событий, отправляемых в рамках сущности "Детали пользователя"
enum UserDetailsEvents {
    UPDATE = "update",
    SET_LOADING = "set-loading"
}
// Список событий, отправляемых в рамках ui
enum GlobalEvents {
    SET_MODAL_CONFIRM = "set-modal-confirm",
    SET_IMAGES_CAROUSEL = "set-images-carousel"
};

export {
    MainClientEvents,
    SocketEvents,
    UserEvents,
    ProfileEvents,
    UserDetailsEvents,
    GlobalEvents
};