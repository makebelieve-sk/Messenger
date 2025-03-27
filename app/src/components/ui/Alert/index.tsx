import { JSX, memo } from "react";
import { Slide, Alert } from "@mui/material";

import "./alert.scss";

interface IAlertComponent {
	show?: boolean;
	children?: React.ReactNode;
	status?: "error" | "success" | "warning" | "info";
	className?: string;
	onClose?: () => void;
	severity?: "success" | "info" | "warning" | "error";
}

export default memo(function AlertComponent({
	show,
	children,
	status = "success",
	className,
	onClose,
	severity
}: IAlertComponent) {
	return <Slide
		in={show}
		mountOnEnter
		unmountOnExit
		timeout={1000}
		className={"slide"}
	>
		<Alert color={status} className={className} onClose={onClose} severity={severity}>
			{children}
		</Alert>
	</Slide>
});
