import { memo, type MouseEvent, type ReactNode } from "react";
import MenuItem from "@mui/material/MenuItem";

interface IMenuItemComponent {
    children: ReactNode;
    onClick?: (event: MouseEvent<HTMLLIElement, globalThis.MouseEvent>) => void;
    value?: string;
    className?: string
};

// Базовый компонент элемента меню
export default memo(function MenuItemComponent({ children, onClick, value, className }: IMenuItemComponent) {
	return <MenuItem className={className} value={value} onClick={onClick}>
		{children}
	</MenuItem>;
});