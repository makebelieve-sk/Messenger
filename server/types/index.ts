import http, { IncomingMessage, ServerResponse } from "http";
import { ISocketUser } from "@custom-types/socket.types";

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

export type TimeoutType = ReturnType<typeof setTimeout>;

export type ServerType = http.Server<typeof IncomingMessage, typeof ServerResponse>;