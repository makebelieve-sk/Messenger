import { memo, type ReactNode } from "react";
import ListItem, { type ListItemProps } from "@mui/material/ListItem";

interface IListItemComponent extends ListItemProps {
    className?: string;
    children: ReactNode;
};

// Базовый компонент элемента списка
export default memo(function ListItemComponent({ className, children, ...props }: IListItemComponent) {
	return <ListItem className={className} {...props}>
		{children}
	</ListItem>;
});