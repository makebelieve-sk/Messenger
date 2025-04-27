import { type NotificationSettings } from "@core/models/NotificationSettings";
import { type Photos } from "@core/models/Photos";
import { type UserDetails } from "@core/models/UserDetails";
import type { IApiUser, IApiUserDetails } from "@custom-types/api.types";

// Контракт модели "Пользователь"
export interface User {
	photos: Photos;
	details: UserDetails;
	settings?: NotificationSettings;

	id: string;
	firstName: string;
	thirdName: string;
	phone: string;
	email: string;
	fullName: string;
	avatarUrl: string;
	avatarCreateDate: string;

	updateUser: ({ user, userDetails }: { user: IApiUser; userDetails: IApiUserDetails; }) => void;
	changeAvatar: (updatedAvatar?: { newAvatarUrl: string; avatarCreationDate: string; }) => void;
};
