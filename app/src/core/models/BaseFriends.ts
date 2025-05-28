import { ApiRoutes } from "common-types";

import { type IFriend } from "@custom-types/friends.types";

export interface IGetAll<T> { 
    route: ApiRoutes;
    page?: number;
    data?: { ids: string[] };
    setLoading: (isLoading: boolean) => void; 
    successCb: (data: { success: boolean; } & T) => void; 
};

// Контракт модели "Управление друзьями"
export interface BaseFriends {
    setCount(count: number): void;
    add(user: IFriend): void;
    remove(userId: string): void;
    find(userId: string): IFriend | undefined;
};