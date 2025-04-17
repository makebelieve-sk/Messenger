import { type INotificationSettings } from "@custom-types/models.types";

// Интерфейс объекта пользователя, полученного с сервера
export interface IApiUser {
	id: string;
	firstName: string;
	secondName: string | null;
	thirdName: string;
	email: string;
	phone: string;
	avatarUrl: string | null;
	avatarCreateDate: string | null;
};

// Интерфейс объекта доп. информации о пользователе, полученного с сервера
export interface IApiUserDetails {
	userId: string;
	birthday: string;
	city: string | null;
	work: string | null;
	sex: string | null;
	lastSeen: string | null;
};

export interface IUserData {
	isMe?: boolean;
	user: IApiUser;
	userDetails: IApiUserDetails;
	notificationSettings?: INotificationSettings;
};
