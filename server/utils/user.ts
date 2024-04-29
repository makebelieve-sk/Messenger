import { ISaveUser } from "../database/models/Users";
import { IUser } from "../types/models.types";

export function getSaveUserFields(user: IUser): ISaveUser {
    return {
        id: user.id,
        firstName: user.firstName,
        secondName: user.secondName,
        thirdName: user.thirdName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl
    };
}