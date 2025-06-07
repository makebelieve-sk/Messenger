import { type Request } from "express";

import { type ISocketUser } from "@custom-types/socket.types";
import { type ISafeUser } from "@custom-types/user.types";

interface IRequestWithSharpedAvatar extends Request {
	sharpedAvatarUrl: string;
	sharpedPhotoUrl: string;
};

interface IRequestWithShapedImages extends Request {
	sharpedImageUrls: string[];
};

// Необходимо объявление модуля для корректной работы в файле eslint.config.ts
declare module "eslint-plugin-import";

// Определяем типы для ядра "Express.Request" (для самого "Express.js" для использования в API)
declare module "express-serve-static-core" {
	interface Request {
		user: ISafeUser;

		sharpedImageUrls?: string[];
		sharpedAvatarUrl?: string;
		sharpedPhotoUrl?: string;
	};
};

// Определяем глобально типы для "Express.User" (только для использования в "Passport.js")
declare global {
	namespace Express {
		interface User extends ISafeUser {}
	};
};

// Определяем глобально модуль "socket.io"
declare module "socket.io" {
	interface Socket {
		user: ISocketUser;
	};
};

// Определяем глобально модуль "http"
declare module "http" {
	interface IncomingMessage {
		sessionID: string;
		session: Express.Session;
	};
};
