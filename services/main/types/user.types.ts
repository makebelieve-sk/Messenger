import { IUser } from "@custom-types/models.types";

export type ISafeUser = Omit<IUser, "password" | "salt" | "avatarId"> & {
	avatarUrl: string | null;
	avatarCreateDate: string | null;
};

export type UserPartial = Pick<ISafeUser, "id" | "firstName" | "thirdName" | "avatarUrl">;

// Интерфейс профиля GitHub
export interface GitHubProfile {
	id: string;
	nodeId?: string;
	displayName: string;
	username?: string;
	profileUrl?: string;
	emails?: Array<{ value: string }>;
	photos?: Array<{ value: string }>;
}