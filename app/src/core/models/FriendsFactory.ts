import { type BaseFriends } from "@core/models/BaseFriends";

// Контракт модели "Фабрика друзей"
export interface FriendsFactory {
    createFriendsManager(): BaseFriends;
    createOutgoingRequestsManager(): BaseFriends;
    createFollowersManager(): BaseFriends;
    createBlockedUsersManager(): BaseFriends;
    createOnlineFriendsManager(): BaseFriends;
    createCommonFriendsManager(): BaseFriends;
};