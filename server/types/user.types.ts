import { IUser } from "./models.types";

export type ISafeUser = Omit<IUser, "password" | "salt">;

export type UserPartial = Pick<ISafeUser, "id" | "firstName" | "thirdName" | "avatarUrl">;