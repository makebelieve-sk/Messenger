import { type ChangeEvent, memo } from "react";
import TextField from "@mui/material/TextField";

interface ITextFieldComponent {
    id?: string;
    name?: string;
    type?: string;
    margin?: "dense" | "normal" | "none";
    variant?: "standard" | "outlined" | "filled";
    label?: string;
    autoComplete?: string;
    required?: boolean;
    fullWidth?: boolean;
    value?: string;
    autoFocus?: boolean;
    error?: boolean;
    helperText?: string | null;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
};

// Базовый компонент текстового поля
export default memo(function TextFieldComponent({ 
	id, 
	name, 
	type, 
	margin, 
	variant, 
	label, 
	autoComplete, 
	required, 
	fullWidth, 
	value, 
	autoFocus, 
	error, 
	helperText, 
	onChange, 
	className,
}: ITextFieldComponent) {
	return <TextField
		data-testid="text-field"
		id={id}
		name={name}
		type={type}
		margin={margin}
		variant={variant}
		label={label}
		autoComplete={autoComplete}
		required={required}
		fullWidth={fullWidth}
		value={value}
		autoFocus={autoFocus}
		error={error}
		helperText={helperText}
		onChange={onChange}
		className={className}
	/>;
});
