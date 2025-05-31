import { memo, type ReactNode } from "react";
import Menu from "@mui/material/Menu";

interface IMenuComponent {
    id?: string;
    children: ReactNode;
    anchorEl: Element | undefined;
    anchorOrigin: {
        vertical: "top" | "bottom";
        horizontal: "left" | "center" | "right";
    };
    open: boolean;
    autoFocus?: boolean;
    onClose: (e: Object, reason: "backdropClick" | "escapeKeyDown") => void;
};

// Базовый компонент меню
export default memo(function MenuComponent({ id, children, anchorEl, anchorOrigin, open, autoFocus = false, onClose }: IMenuComponent) {
	return <Menu
		id={id}
		anchorEl={anchorEl}
		anchorOrigin={anchorOrigin}
		open={open}
		autoFocus={autoFocus}
		onClose={onClose}
	>
		{children}
	</Menu>;
});