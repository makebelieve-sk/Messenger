import { memo, type ReactNode } from "react";
import ListItemText, { type ListItemTextProps } from "@mui/material/ListItemText";

interface IListItemText extends ListItemTextProps {
    className?: string;
    primary: string;
    secondary: ReactNode;
};

// Базовый компонент контента элемента списка
export default memo(function ListItemTextComponent({ className, primary, secondary, ...props }: IListItemText) {
	return <ListItemText
		className={className}
		primary={primary}
		secondary={secondary}
		{...props}
	/>;
});