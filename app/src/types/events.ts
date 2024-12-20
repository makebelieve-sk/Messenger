enum MainClientEvents {
    REDIRECT = "redirect",
    GET_ME = "get-me",
    ERROR = "error",
};

enum SocketEvents {
    RECONNECT = "reconnect"
};

export {
    MainClientEvents,
    SocketEvents
};