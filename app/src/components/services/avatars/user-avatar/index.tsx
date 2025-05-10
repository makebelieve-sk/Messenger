import { memo } from "react";

import AvatarComponent from "@components/ui/avatar";

import "./user-avatar.scss";

interface IUserAvatarComponent {
	src: string | null;
	alt: string;
	userId: string;
	id?: string;
	className?: string;
};

// Сервисный компонент, используется для отрисовки аватара пользователя
export default memo(function UserAvatarComponent({ className = "", ...props }: IUserAvatarComponent) {
	return <AvatarComponent 
		{...props} 
		id="user-avatar"
		className={`user-avatar ${className}`}
	/>;
});