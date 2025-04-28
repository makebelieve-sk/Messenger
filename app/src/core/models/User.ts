import EventEmitter from "eventemitter3";

import { UserDetails } from "@core/models/UserDetails";
import { IUser, IUserDetails } from "@custom-types/models.types";

// Контракт модели "Пользователь"
export interface User extends EventEmitter {
    id: string;
    user: IUser;
    firstName: string;
    thirdName: string;
    phone: string;
    email: string;  
    fullName: string;
    avatarUrl: string;
    userDetails: UserDetails;

    updateMe: () => void;
    changeField: (field: string, value: string) => void;
    updateInfo: ({ user, userDetails }: { user: IUser, userDetails: IUserDetails }) => void;
}
