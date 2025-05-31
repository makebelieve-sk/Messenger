import { memo, type ReactNode } from "react";
import List, { type ListProps } from "@mui/material/List";

interface IListComponent extends ListProps {
    className?: string;
    children: ReactNode;
};

// Базовый компонент списка
export default memo(function ListComponent({ className, children, ...props }: IListComponent) {
	return <List className={className} {...props}>
		{children}
	</List>;
});