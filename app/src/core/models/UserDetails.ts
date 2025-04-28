import EventEmitter from "eventemitter3";

import { IUserDetails } from "@custom-types/models.types";

// Контракт модели "Дополнительная информация о пользователе"
export interface UserDetails extends EventEmitter {
    details: IUserDetails;
    birthday: string;
    city: string;
    work: string;

    editDetails: (details: IUserDetails) => void;
    updateDetails: () => void;
    getFriendsText: (count: number) => string;
    getSubscribersText: (count: number) => string;
    getPhotosText: (count: number) => string;
    getAudiosText: (count: number) => string;
    getVideosText: (count: number) => string;
}