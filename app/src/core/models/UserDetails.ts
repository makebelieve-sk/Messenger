import { UserDetailsEvents } from "@custom-types/events";
import { IUserDetails } from "@custom-types/models.types";
import EventEmitter from "eventemitter3";

// Контракт модели "Дополнительная информация о пользователе"
export interface UserDetails extends EventEmitter {
    details: IUserDetails | null;
    birthday: string;
    city: string;
    work: string;

    updateDetails: (details: IUserDetails) => void;
    getFriendsText: (count: number) => string;
    getSubscribersText: (count: number) => string;
    getPhotosText: (count: number) => string;
    getAudiosText: (count: number) => string;
    getVideosText: (count: number) => string;
}