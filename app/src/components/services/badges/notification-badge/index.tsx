import { memo } from "react";
import Badge from "@mui/material/Badge";

import "./notification-badge.scss";

interface INotificationBadge {
    content: string | number | null;
	className?: string;
};

// Общий компонент значка уведомления в виде Badge
export default memo(function NotificationBadge({ content = null, className = "", ...props }: INotificationBadge) {
	return <Badge
		{ ...props }
		className={`notification-badge ${className}`}
		color="default"
		badgeContent={content}
	/>;
});