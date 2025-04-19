import { type FormEvent, memo, type ReactNode } from "react";
import Box from "@mui/material/Box";

interface IBoxComponent {
    children: ReactNode;
	id?: string;
    className?: string;
    component?: "section" | "form" | "div" | "span";
    noValidate?: boolean;
    onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
};

// Базовый компонент бокса
export default memo(function BoxComponent({ children, id, className = "", component = "div", noValidate, onSubmit }: IBoxComponent) {
	return <Box
		id={id}
		className={className}
		component={component}
		noValidate={noValidate}
		onSubmit={onSubmit}
	>
		{children}
	</Box>;
});
