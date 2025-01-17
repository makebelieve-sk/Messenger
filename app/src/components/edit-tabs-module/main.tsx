import React from "react";
import { Dayjs } from "dayjs";
import TextField from "@mui/material/TextField";
import DatePickerComponent from "./date-picker";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { ITabModule } from ".";
import  "../../styles/pages/edit-tab.scss";

export default React.memo(function Main({ formValues, formErrors, onChange }: ITabModule) {
    const onChangeField = (field: string, value: string | boolean | Date | null | Dayjs) => {
        onChange(field, value);
    };
    console.log("Main", formValues);
    
    return <>
        <TextField
            id="name"
            name="name"
            margin="normal"
            variant="outlined"
            label="Имя"
            autoComplete="Имя"
            fullWidth
            value={formValues.name}
            required
            autoFocus

            error={Boolean(formErrors && formErrors.name)}
            helperText={formErrors && formErrors.name ? formErrors.name : null}

            onChange={e => onChangeField("name", e.target.value)}
        />

        <TextField
            id="surName"
            name="surName"
            margin="normal"
            variant="outlined"
            label="Фамилия"
            autoComplete="Фамилия"
            fullWidth
            value={formValues.surName}
            required

            error={Boolean(formErrors && formErrors.surName)}
            helperText={formErrors && formErrors.surName ? formErrors && formErrors.surName : null}

            onChange={e => onChangeField("surName", e.target.value)}
        />

        <FormControl fullWidth className={"edit-container__sex-select"}>
            <InputLabel id="sex-input">Пол</InputLabel>
            <Select
                labelId="sex-input"
                id="sex-select"
                value={formValues.sex}
                label="Пол"
                onChange={e => onChangeField("sex", e.target.value)}
            >
                <MenuItem value="">не указано</MenuItem>
                <MenuItem value="мужской">мужской</MenuItem>
                <MenuItem value="женский">женский</MenuItem>
            </Select>
        </FormControl>

        <DatePickerComponent formValues={formValues} onChangeField={onChangeField}/>
    
        <TextField
            id="work"
            name="work"
            margin="normal"
            variant="outlined"
            label="Место работы"
            autoComplete="Место работы"
            fullWidth
            value={formValues.work}
            className={"edit-container__work"}

            onChange={e => onChangeField("work", e.target.value)}
        />
    </>
});