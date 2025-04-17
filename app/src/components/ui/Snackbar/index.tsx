import { JSX } from "react";
import Snackbar from "@mui/material/Snackbar";

import { SNACKBAR_TIMEOUT } from "@utils/constants";

interface ISnackBarComponent {
	anchor: { vertical: "top" | "bottom"; horizontal: "left" | "center" | "right" };
	message?: string;
	open: boolean;
	handleClose?: () => void;
	children?: JSX.Element;
};

// Базовый компонент небольшого всплывающего окна
export default function SnackbarComponent({ anchor, message, open, handleClose, children }: ISnackBarComponent) {
	return <Snackbar 
		key={message + anchor.toString() + open} 
		anchorOrigin={anchor} 
		open={open} 
		onClose={handleClose} 
		message={message} 
		autoHideDuration={SNACKBAR_TIMEOUT}
	>
		{children}
	</Snackbar>;
}
