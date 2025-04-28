import { memo, type MouseEvent, type ReactNode } from "react";
import Button from "@mui/material/Button";

export interface IButtonComponent {
    children: ReactNode;
    className?: string;
    variant?: "text" | "outlined" | "contained";
    disabled?: boolean;
    loading?: boolean;
    size?: "small" | "medium" | "large";
    href?: string;
    type?: "button" | "submit" | "reset";
    fullWidth?: boolean;
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
    onClick?: (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void;
    startIcon?: ReactNode;
};

// Базовый компонент кнопки
export default memo(function ButtonComponent({ 
	children, 
	className, 
	variant, 
	loading,
	disabled, 
	href, 
	color, 
	onClick, 
	size, 
	type, 
	fullWidth, 
	startIcon, 
}: IButtonComponent) {
	return <Button
		className={className}
		variant={variant}
		loading={loading}
		disabled={disabled}
		href={href}
		color={color}
		onClick={e => onClick?.(e)}
		type={type}
		size={size}
		fullWidth={fullWidth}
		startIcon={startIcon}
	>
		{children}
	</Button>;
});
