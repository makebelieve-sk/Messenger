import Button from "@mui/material/Button";
import { JSX } from "react";

interface IButtonComponent {
    children: React.ReactNode;
    className?: string;
    variant?: "text" | "outlined" | "contained";
    disabled?: boolean;
    loading?: boolean;
    size?: "small" | "medium" | "large";
    href?: string;
    type?: "button" | "submit" | "reset";
    fullWidth?: boolean;
    color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
    onClick?: () => void;
    startIcon?: JSX.Element;
};

// Базовый компонент кнопки
export default function ButtonComponent({ children, className, variant, disabled, href, color, onClick, size, type, fullWidth, startIcon }: IButtonComponent) {
    return <Button
        className={className}
        variant={variant}
        disabled={disabled}
        href={href}
        color={color}
        onClick={onClick}
        type={type}
        sx={{ fontSize: size }}
        fullWidth={fullWidth}
        startIcon={startIcon}>
        {children}
    </Button>
}