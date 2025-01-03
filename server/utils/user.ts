import { IUser } from "../types/models.types";
import { ISafeUser } from "../types/user.types";

export function getSafeUserFields(user: IUser): ISafeUser {
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