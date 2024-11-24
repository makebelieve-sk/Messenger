import { IUser } from "./models.types";

export type UsersType = Map<string, IUser>;

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

export interface IFormValues {
    name: string;
    surName: string;
    sex: string;
    birthday: string;
    work: string;
    city: string;
    phone: string;
    email: string;
};

export type TimeoutType = ReturnType<typeof setTimeout>;

export type ErrorType = unknown | Error;