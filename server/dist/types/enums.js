"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendActionType = exports.RedisKeys = exports.RedisChannel = void 0;
// Каналы Redis
var RedisChannel;
(function (RedisChannel) {
    RedisChannel["TEMP_CHAT_ID"] = "TEMP_CHAT_ID";
})(RedisChannel || (exports.RedisChannel = RedisChannel = {}));
;
// Список ключей редиса
var RedisKeys;
(function (RedisKeys) {
    RedisKeys["SESS"] = "sess";
    RedisKeys["REMEMBER_ME"] = "rememberMe";
})(RedisKeys || (exports.RedisKeys = RedisKeys = {}));
;
// Типы действий пользователей в разделе "Друзья"
var FriendActionType;
(function (FriendActionType) {
    FriendActionType[FriendActionType["FOLLOWING"] = 0] = "FOLLOWING";
    FriendActionType[FriendActionType["FRIEND"] = 1] = "FRIEND";
    FriendActionType[FriendActionType["BLOCKED"] = 2] = "BLOCKED";
    FriendActionType[FriendActionType["LEFT_IN_FOLLOWERS"] = 3] = "LEFT_IN_FOLLOWERS";
})(FriendActionType || (exports.FriendActionType = FriendActionType = {}));
;
//# sourceMappingURL=enums.js.map