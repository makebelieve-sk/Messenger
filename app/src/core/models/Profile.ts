import { type IUpdatedAvatar } from "@components/ui/change-avatar";
import { type Photos } from "@core/models/Photos";
import { type User } from "@core/models/User";
import { type IFormValues } from "@pages/Edit";

// Контракт модели "Профиль пользователя"
export interface Profile {
	isMe: boolean;
	userService: User;
	photosService: Photos;

	onSetAvatar: (updateOptions: IUpdatedAvatar) => void;
	onDeleteAvatar: () => void;
	onClickAvatar: () => void;

	getFriends: () => void;
	editInfo: (result: IFormValues) => void;
};
