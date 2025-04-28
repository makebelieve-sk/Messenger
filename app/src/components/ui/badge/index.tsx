import { memo, type ReactNode } from "react";
import Badge from "@mui/material/Badge";

import useGlobalStore from "@store/global";

import "./badge.scss";

interface IBadgeComponent {
    userId: string;
    children: ReactNode;
	className?: string;
};

const anchorOrigin = { vertical: "bottom", horizontal: "right" } as const;

// Базовый компонент Badge (используется для пометки, является ли сейчас этот пользователь онлайн или нет)
export default memo(function BadgeComponent({ userId, children, className = "", ...props }: IBadgeComponent) {
	const isOnline = useGlobalStore(state => state.onlineUsers.has(userId));

	return <Badge
		{...props}
		className={`avatar-badge ${isOnline ? "avatar-badge__active" : ""} ${className}`}
		overlap="circular"
		anchorOrigin={anchorOrigin}
		variant="dot"
	>
		{children}
	</Badge>;
});