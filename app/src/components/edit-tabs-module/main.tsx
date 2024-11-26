import React from "react";
import "dayjs/locale/ru";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ITabModule } from ".";

import  "../../styles/pages/edit-tab.scss";
import dayjs, { Dayjs } from "dayjs";

export default React.memo(function Main({ formValues, formErrors, onChange }: ITabModule) {
    const onChangeField = (field: string, value: string | boolean | Date | null | Dayjs) => {
        onChange(field, value);
    };
    
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
                <MenuItem value="мужской">мужской</MenuItem>
                <MenuItem value="женский">женский</MenuItem>
            </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
            <DatePicker
                disableFuture
                label="День рождения"
                // inputFormat="YYYY-MM-DD"
                value={dayjs(formValues.birthday)}
                onChange={(newValue: Dayjs | null) =>{
                    const formattedValue = newValue ? newValue.format('YYYY-MM-DD') : null;
                    onChangeField("birthday", formattedValue);
                }}
                slotProps={{
                    textField: {
                        fullWidth: true,
                        inputProps: {
                            placeholder: "Укажите дату",
                        },
                    },
                }}
            />
        </LocalizationProvider>

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