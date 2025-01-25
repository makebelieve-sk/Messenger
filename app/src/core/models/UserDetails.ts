import { IUserDetails } from "@custom-types/models.types";

// Контракт модели "Дополнительная информация о пользователе"
export interface UserDetails {
    details: IUserDetails | null;
    birthday: string;
    city: string;
    work: string;

    setDetails: (details: IUserDetails) => void;
    getFriendsText: (count: number) => string;
    getSubscribersText: (count: number) => string;
    getPhotosText: (count: number) => string;
    getAudiosText: (count: number) => string;
    getVideosText: (count: number) => string;
}