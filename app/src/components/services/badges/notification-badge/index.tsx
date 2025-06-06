import { memo } from "react";
import Badge, { type BadgeProps } from "@mui/material/Badge";

import "./notification-badge.scss";

interface INotificationBadge extends BadgeProps {
    content: string | undefined;
	className?: string;
};

// Общий компонент значка уведомления в виде Badge
export default memo(function NotificationBadge({ content = "", className = "", ...props }: INotificationBadge) {
	return <Badge
		{ ...props }
		className={`notification-badge ${className}`}
		color="default"
		badgeContent={content || undefined}
		data-testid="notification-badge"
	/>;
});