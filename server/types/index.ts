import type { IncomingMessage, Server, ServerResponse } from "http";

import { type ISocketUser } from "@custom-types/socket.types";

export type UsersType = Map<string, ISocketUser>;

export interface IImage {
	id: string;
	src: string;
	alt: string;
	originalSrc?: string;
	cols?: number;
	rows?: number;
	authorName?: string;
	authorAvatarUrl?: string;
	dateTime?: string;
	fromProfile?: boolean;
};

export type ServerType = Server<typeof IncomingMessage, typeof ServerResponse>;