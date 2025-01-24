enum MainClientEvents {
    REDIRECT = "redirect",
    GET_ME = "get-me",
    ERROR = "error",
    SIGN_IN = "sign-in",
    LOG_OUT = "logout",
};

enum SocketEvents {
    RECONNECT = "reconnect"
};

enum UserEvents {
    CHANGE_FIELD = "change-field",
    SET_LOADING = "set-loading",
};

enum UserDetailsEvents {
    UPDATE = 'update',
    SET_LOADING = 'set-loading'
}

export {
    MainClientEvents,
    SocketEvents,
    UserEvents,
    UserDetailsEvents
};