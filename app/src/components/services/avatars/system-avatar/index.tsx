import { memo, type ReactNode } from "react";
import { Avatar } from "@mui/material";

import "./system-avatar.scss";

interface ISystemAvatarComponent {
	children: ReactNode;
	className?: string;
};

// Сервисный компонент, используется для отрисовки иконки в виде аватара
export default memo(function SystemAvatarComponent({ children, className = "" }: ISystemAvatarComponent) {
	return <Avatar
		id="system-avatar"
		className={`system-avatar ${className}`}
		alt="system-avatar" 
		children={children} 
	/>;
});