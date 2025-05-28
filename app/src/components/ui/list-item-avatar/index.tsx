import { memo, type ReactNode } from "react";
import ListItemAvatar, { type ListItemAvatarProps } from "@mui/material/ListItemAvatar";

interface IListItemAvatar extends ListItemAvatarProps {
    className?: string;
    children: ReactNode;
};

// Базовый компонент аватара внутри элемента списка
export default memo(function ListItemAvatarComponent({ className, children, ...props }: IListItemAvatar) {
	return <ListItemAvatar className={className} {...props}>
		{children}
	</ListItemAvatar>;
});