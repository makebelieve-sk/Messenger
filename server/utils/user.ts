import Logger from "@service/logger";
import { IUser } from "@custom-types/models.types";
import { ISafeUser } from "@custom-types/user.types";

const logger = Logger("utils/user");

export function getSafeUserFields(user: IUser): ISafeUser {
    logger.debug("getSafeUserFields [user=%j]", user);

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