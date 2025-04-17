import { IUser } from "@custom-types/models.types";

export type ISafeUser = Omit<IUser, "password" | "salt" | "avatarId"> & {
	avatarUrl: string | null;
	avatarCreateDate: string | null;
};

export type UserPartial = Pick<ISafeUser, "id" | "firstName" | "thirdName" | "avatarUrl">;
