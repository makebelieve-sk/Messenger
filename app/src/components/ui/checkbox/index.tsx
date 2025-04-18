import Checkbox from "@mui/material/Checkbox";

interface ICheckboxComponent {
    value?: boolean;
    color?: "primary";
    id?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
};

export default function CheckboxComponent({ value, id, color, onChange }: ICheckboxComponent) {
	return <Checkbox
		value={value}
		color={color}
		id={id}
		onChange={onChange}
	/>;
}