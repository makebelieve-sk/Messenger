import { memo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";

import "./input-search.scss";

interface IInputSearch {
    classNameInput?: string;
    classNameIcon?: string;
    haveBorder?: boolean;
    placeholder: string;
    value: string;
    onChange: (newValue: string) => void;
};

// Базовый компонент "Поле поиска"
export default memo(function InputSearch({ 
	classNameInput, 
	classNameIcon, 
	placeholder, 
	value, 
	haveBorder = false, 
	onChange, 
}: IInputSearch) {
	return <div className={`input-search ${haveBorder ? "input-search__field-with-border" : ""}`}>
		<SearchIcon className={`input-search__icon ${classNameIcon ?? ""}`} />

		<InputBase
			id="standard-input"
			autoFocus
			placeholder={placeholder}
			fullWidth
			size="medium"
			className={`input-search__field ${classNameInput ?? ""}`}
			value={value}
			onChange={event => onChange(event.target.value)}
		/>
        
		{value && (
			<CloseIcon 
				className="input-search__close-icon" 
				onClick={() => onChange("")}
			/>
		)}
	</div>;
});