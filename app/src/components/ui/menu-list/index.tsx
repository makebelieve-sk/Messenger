import { memo, type ReactNode } from "react";
import MenuList from "@mui/material/MenuList";

import "./menu-list.scss";

interface IMenuListComponent {
    children: ReactNode;
    className?: string;
};

// Общий компонент списка меню
export default memo(function MenuListComponent({ children, className, ...props }: IMenuListComponent) {
	return <MenuList {...props} className={`menu__list ${className}`}>
		{children}
	</MenuList>;
});