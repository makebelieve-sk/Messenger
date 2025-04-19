import { memo, type ReactNode } from "react";
import Menu from "@mui/material/Menu";

interface IMenuComponent {
    children: ReactNode;
    anchorEl: HTMLElement | null;
    anchorOrigin: {
        vertical: "top" | "bottom";
        horizontal: "left" | "center" | "right";
    };
    open: boolean;
    autoFocus: boolean;
    onClose: (e: Object, reason: "backdropClick" | "escapeKeyDown") => void;
};

// Базовый компонент меню
export default memo(function MenuComponent({ children, anchorEl, anchorOrigin, open, autoFocus, onClose }: IMenuComponent) {
	return <Menu
		anchorEl={anchorEl}
		anchorOrigin={anchorOrigin}
		open={open}
		autoFocus={autoFocus}
		onClose={onClose}
	>
		{children}
	</Menu>;
});