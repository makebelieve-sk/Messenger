"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEvents = void 0;
var SocketEvents;
(function (SocketEvents) {
    SocketEvents["SEND"] = "send";
    SocketEvents["SEND_BROADCAST"] = "sendBroadcast";
    SocketEvents["NOTIFY_ANOTHER_USER"] = "notifyAnotherUser";
    SocketEvents["NOTIFY_FEW_ANOTHER_USERS"] = "notifyFewAnotherUsers";
    SocketEvents["HANDLE_ERROR"] = "handleError";
})(SocketEvents || (exports.SocketEvents = SocketEvents = {}));
;
//# sourceMappingURL=events.js.map