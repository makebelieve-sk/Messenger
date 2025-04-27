import { type ElementType, memo, type ReactNode } from "react";
import Typography from "@mui/material/Typography";

interface ITypographyComponent {
    children: ReactNode;
    variant?: "body1" | "body2" | "h5" | "h6" | "caption" | "subtitle1";
    className?: string;
    id?: string;
    component?: ElementType;
};

// Базовый компонент текста
export default memo(function TypographyComponent({ children, variant = "body1", className, id, component = "p" }: ITypographyComponent) {
	return <Typography
		variant={variant}
		className={className}
		id={id}
		component={component}
	>
		{children}
	</Typography>;
});
