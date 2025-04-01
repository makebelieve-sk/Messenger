import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";

import "./select.scss";

interface ISelectComponent {
    children: React.ReactNode;
    text?: string;
    labelId?: string;
    id?: string;
    value?: string;
    onChange?: (e: SelectChangeEvent<string>) => void;
};

export default function SelectComponent({ children, labelId, id, value, onChange, text }: ISelectComponent) {
    return (
        <div className="select">
            <InputLabel className="select__label" id={labelId}>{text}</InputLabel>
            <Select
                labelId={labelId}
                id={id}
                value={value}
                onChange={onChange}
                className="select__input"
            >
                {children}
            </Select>
        </div>
    );
}