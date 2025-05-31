import { type FriendsTab } from "common-types";

import type FriendsController from "@core/controllers/FriendsController";
import { type IUser } from "@custom-types/models.types";

// Контракт модели "Сервис друзей"
export interface Friends {
    friendsController: FriendsController;
    
    checkOnlineUsers(users: IUser[]): void;
    removeOnlineUser(userId: string): void;
    getFriends(type: FriendsTab): void;
    loadMore(type: FriendsTab, resolve: () => void): void;
    search(type: FriendsTab, value: string): void;

    followFriend(friendId: string): void;
    writeMessage(friendId: string): void;
    addFriend(friendId: string): void;
    accept(friendId: string): void;
    leftInFollowers(friendId: string): void;
    unfollow(friendId: string): void;
    deleteFriend(friendId: string): void;
    blockFriend(friendId: string): void;
    unblock(friendId: string): void;
};