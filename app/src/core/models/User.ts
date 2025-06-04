import { type Friends } from "@core/models/Friends";
import { type NotificationSettings } from "@core/models/NotificationSettings";
import { type Photos } from "@core/models/Photos";
import { type UserDetails } from "@core/models/UserDetails";
import type { IApiUser, IApiUserDetails } from "@custom-types/api.types";
import { type IPhoto } from "@custom-types/models.types";

// Контракт модели "Пользователь"
export interface User {
	friendsService: Friends;
	photosService: Photos;
	detailsService: UserDetails;
	settingsService?: NotificationSettings;

	id: string;
	firstName: string;
	thirdName: string;
	phone: string;
	email: string;
	fullName: string;
	avatarUrl: string;
	avatarCreateDate: string;

	updateUser: ({ user, userDetails }: { user: IApiUser; userDetails: IApiUserDetails; }) => void;
	syncInfo: () => void;
	changeAvatar: (updatedAvatar?: IPhoto) => void;
};