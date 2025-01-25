import EventEmitter from "eventemitter3";

import { IUser, IUserDetails } from "@custom-types/models.types";
import { UserDetails } from "@core/models/UserDetails";

// Контракт модели "Пользователь"
export interface User extends EventEmitter {
    id: string;
    user: IUser;
    fullName: string;
    avatarUrl: string;
    userDetails: UserDetails;

    updateMe: () => void;
    changeField: (field: string, value: string) => void;
    setUserDetails: (userDetails: IUserDetails) => void;
}