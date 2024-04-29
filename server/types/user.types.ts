import { IUser } from "./models.types";

export type UserPartial = Pick<IUser, "id" | "firstName" | "thirdName" | "avatarUrl">;