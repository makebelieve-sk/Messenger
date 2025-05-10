import { MessageTypes } from "common-types";

// Интерфейс атрибутов модели User
export interface IUser {
	id: string;
	firstName: string;
	secondName: string | null;
	thirdName: string;
	email: string;
	phone: string;
	password: string;
	salt: string;
	avatarId: string | null;
	isDeleted: boolean;
};

// Интерфейс атрибутов модели Photo
export interface IPhoto {
	id: string;
	userId: string;
	path: string;
	size: number;
	extension: string;
	createdAt: string;
};

// Интерфейс атрибутов модели User_Detail
export interface IUserDetail {
	userId: string;
	birthday: string | null;
	city: string | null;
	work: string | null;
	sex: string | null;
	lastSeen: string | null;
};

// Интерфейс атрибутов модели User_Photo
export interface IUserPhoto {
	photoId: string;
	userId: string;
};

// Интерфейс атрибутов модели Notification_Settings
export interface INotificationSettings {
	userId: string;
	soundEnabled: boolean;
	messageSound: boolean;
	friendRequestSound: boolean;
};

// Интерфейс атрибутов модели Friend_Action
export interface IFriendAction {
	id: string;
	sourceUserId: string;
	targetUserId: string;
	actionType: number;
};

// Интерфейс атрибутов модели Friend_Action_Log
export interface IFriendActionLog {
	id: string;
	sourceUserId: string;
	targetUserId: string;
	actionType: number;
	createdAt: string;
};

// Интерфейс атрибутов модели Chat
export interface IChat {
	id: string;
	avatarId: string | null;
	name: string | null;
};

// Интерфейс атрибутов модели DisabledChatSound
export interface IDisabledChatSound {
	chatId: string;
	userId: string;
};

// Интерфейс атрибутов модели UserInChat
export interface IUserInChat {
	userId: string;
	chatId: string;
};

// Интерфейс атрибутов модели Message
export interface IMessage {
	id: string;
	userId: string;
	chatId: string;
	type: MessageTypes;
	message: string;
	createdAt: string;
};

// Интерфейс атрибутов модели UserMessageStatus
export interface IUserMessageStatus {
	messageId: string;
	userId: string;
	isRead: number;
	isDeleted: number;
};

// Интерфейс атрибутов модели PhotoInMessage
export interface IPhotoInMessage {
	photoId: string;
	messageId: string;
};

// Интерфейс атрибутов модели File
export interface IFile {
	id: string;
	userId: string;
	name: string;
	path: string;
	size: number;
	extension: string;
	createdAt: string;
};

// Интерфейс атрибутов модели FileInMessage
export interface IFileInMessage {
	fileId: string;
	messageId: string;
};
