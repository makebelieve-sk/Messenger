import { type FormEvent, forwardRef, memo, type ReactNode, type Ref } from "react";
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
export default memo(forwardRef<HTMLDivElement, IBoxComponent>(function BoxComponent({
	children, 
	id, 
	className = "", 
	component = "div", 
	noValidate, 
	onSubmit, 
}: IBoxComponent, parentRef: Ref<HTMLDivElement | null>) {
	return <Box
		id={id}
		ref={parentRef}
		className={className}
		component={component}
		noValidate={noValidate}
		onSubmit={onSubmit}
	>
		{children}
	</Box>;
}));