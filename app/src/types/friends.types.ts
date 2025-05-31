// Интерфейс структуры данных "Друг"
export interface IFriend {
	id: string;
	avatarUrl: string;
	avatarCreateDate: string;
    fullName: string;
	createdAt: string;
	newest?: boolean;
};