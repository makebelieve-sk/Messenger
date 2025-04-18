import { JSX, memo, useEffect, useRef } from "react";
import { Alert, Slide } from "@mui/material";

import { type TimeoutType } from "@custom-types/index";
import { ALERT_TIMEOUT, SLIDE_ALERT_TIMEOUT } from "@utils/constants";

import "./alert.scss";

interface IAlertComponent {
	show: boolean;
	children: JSX.Element | string;
	status?: "error" | "success" | "warning" | "info";
	className?: string;
	severity?: "success" | "info" | "warning" | "error";
	onExited?: () => void;
};

// Общий компонент Alert с анимацией появления/исчезновения
export default memo(function AlertComponent({ show, children, status = "success", className, severity, onExited }: IAlertComponent) {
	const timeoutId = useRef<TimeoutType | null>(null);
	
	// Обрабатываем закрытие Alert (либо скрытие после таймаута, либо скрытие по принуждению)
	useEffect(() => {
		if (onExited && show) onClose();

		// Если мы скрываем Alert, но у нас есть действующий Alert
		if (!show) resetTimeout();

		return () => {
			resetTimeout();
		};
	}, [ show ]);

	// Закрываем Alert, очищая предыдущий таймаут
	const onClose = () => {
		resetTimeout();

		timeoutId.current = setTimeout(() => {
			onExited!();
		}, ALERT_TIMEOUT);
	};

	// Очистка таймера
	const resetTimeout = () => {
		if (timeoutId.current) {
			clearTimeout(timeoutId.current);
			timeoutId.current = null;
		}
	};

	return <Slide 
		in={show} 
		mountOnEnter 
		unmountOnExit 
		timeout={{ enter: SLIDE_ALERT_TIMEOUT, exit: SLIDE_ALERT_TIMEOUT }} 
		className="slide"
	>
		<Alert color={status} className={className} severity={severity}>
			{children}
		</Alert>
	</Slide>;
});
