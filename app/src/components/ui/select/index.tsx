import { memo, type ReactNode } from "react";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";

import "./select.scss";

interface ISelectComponent {
    children: ReactNode;
    text?: string;
    labelId?: string;
    id?: string;
    value?: string;
	className?: string;
    onChange?: (event: SelectChangeEvent<string>) => void;
};

// Базовый компонент списка выбора
export default memo(function SelectComponent({ children, labelId, id, value, text, className, onChange }: ISelectComponent) {
	return (
		<div className="select" data-testid="select">
			<InputLabel className="select__label" id={labelId}>
				{text}
			</InputLabel>

			<Select
				labelId={labelId}
				id={id}
				value={value}
				onChange={onChange}
				className={`select__input ${className}`}
			>
				{children}
			</Select>
		</div>
	);
});
