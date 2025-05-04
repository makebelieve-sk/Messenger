import { memo } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import ButtonComponent, { type IButtonComponent } from "@components/ui/button";

import "./upper-button.scss";

// Базовый компонент кнопки "Вверх"
export default memo(function UpperButton({ ...props }: Omit<IButtonComponent, "children">) {
	return <ButtonComponent { ...props } className="upper-button">
		<KeyboardArrowUpIcon />
	</ButtonComponent>;
});