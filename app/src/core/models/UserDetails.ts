import { type IApiUserDetails } from "@custom-types/api.types";

// Контракт модели "Дополнительная информация о пользователе"
export interface UserDetails {
	updateDetails: (newDetails: IApiUserDetails) => void;
	getFriendsText: (count: number) => string;
	getSubscribersText: (count: number) => string;
	getPhotosText: (count: number) => string;
	getAudiosText: (count: number) => string;
	getVideosText: (count: number) => string;
};