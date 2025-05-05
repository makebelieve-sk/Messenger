import { type ChangeEvent, memo } from "react";
import Switch from "@mui/material/Switch";

interface ISwitchComponent {
    name: string;
    checked: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

// Базовый компонент переключателя
export default memo(function SwitchComponent({ name, checked, onChange }: ISwitchComponent) {
	return <Switch name={name} checked={checked} onChange={onChange} />;
});