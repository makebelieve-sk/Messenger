import { type ChangeEvent, memo } from "react";
import Checkbox from "@mui/material/Checkbox";

interface ICheckboxComponent {
    value?: boolean;
    color?: "primary";
    id?: string;
	className?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
};

// Базовый компонент чекбокса
export default memo(function CheckboxComponent({ value, id, color, className = "", onChange }: ICheckboxComponent) {
	return <Checkbox
		value={value}
		color={color}
		id={id}
		className={className}
		onChange={onChange}
	/>;
});