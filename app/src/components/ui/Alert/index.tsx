import { memo, type ReactNode } from "react";
import Alert from "@mui/material/Alert";

import "./alert.scss";

interface IAlertComponent {
    children: ReactNode;
    color?: "error" | "success" | "warning" | "info";
    className?: string;
    severity?: "success" | "info" | "warning" | "error";
};

// Базовый компонент Alert
export default function AlertComponent({ children, color = "success", className = "", severity }: IAlertComponent) {
	return <Alert 
		color={color} 
		className={`alert ${className}`} 
		severity={severity}
	>
		{children}
	</Alert>
};
