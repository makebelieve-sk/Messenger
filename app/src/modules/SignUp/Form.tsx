import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import PhoneInput from "react-phone-input-2"
import { REQUIRED_FIELD } from "../../utils/constants";
import { ISignUpState } from "../../pages/SignUp";

import "./sign-up.scss";
import "react-phone-input-2/lib/material.css";

interface ISignUpForm {
    formValues: ISignUpState;
    setFormValues: React.Dispatch<React.SetStateAction<ISignUpState>>;
    onChange: (field: string, value: string, validateCallback?: (value: string) => string, anotherField?: string) => void;
};

export default React.memo(function SignUpForm({ formValues, setFormValues, onChange }: ISignUpForm) {
    const checkPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({
            values: {
                ...formValues.values,
                passwordConfirm: e.target.value
            },
            errors: {
                ...formValues.errors,
                password: e.target.value && e.target.value === formValues.values.password
                    ? ""
                    : e.target.value !== formValues.values.password
                        ? "Введенные пароли не совпадают"
                        : REQUIRED_FIELD,
                passwordConfirm: e.target.value && e.target.value === formValues.values.password
                    ? ""
                    : e.target.value !== formValues.values.password
                        ? "Введенные пароли не совпадают"
                        : REQUIRED_FIELD
            }
        });
    };

    const validateFullName = (value: string) => {
        return value
            ? value.length < 3
                ? "Длина поля должна быть не менее 3 символов"
                : ""
            : REQUIRED_FIELD;
    };

    const validateEmail = (value: string) => {
        return value
            ? value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                ? ""
                : "Не верный формат электронной почты (пример: test01@gmail.com)"
            : REQUIRED_FIELD;
    };

    const validatePhone = (value: string) => {
        if (value) {
            const numbersCount = value.match(/\d/g);

            return numbersCount && numbersCount.length && numbersCount.length !== 11
                ? "Длина номера телефона должна быть 11 символов"
                : "";
        }

        return REQUIRED_FIELD;
    };

    const validatePassword = (value: string) => {
        return value
            ? value === formValues.values.passwordConfirm
                ? ""
                : "Введенные пароли не совпадают"
            : REQUIRED_FIELD;
    };

    return (
        <Box className="sign-up-form">
            <React.Suspense fallback={<></>}></React.Suspense>
            
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        id="firstName"
                        name="firstName"
                        margin="normal"
                        variant="outlined"
                        label="Имя"
                        autoComplete="Имя"
                        required
                        fullWidth
                        autoFocus

                        error={Boolean(formValues.errors.firstName)}
                        helperText={formValues.errors.firstName ? formValues.errors.firstName : null}
                        value={formValues.values.firstName}

                        onChange={e => onChange("firstName", e.target.value, validateFullName)}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        id="thirdName"
                        name="thirdName"
                        margin="normal"
                        variant="outlined"
                        label="Фамилия"
                        autoComplete="Фамилия"
                        required
                        fullWidth

                        error={Boolean(formValues.errors.thirdName)}
                        helperText={formValues.errors.thirdName ? formValues.errors.thirdName : null}
                        value={formValues.values.thirdName}

                        onChange={e => onChange("thirdName", e.target.value, validateFullName)}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        id="email"
                        name="email"
                        margin="normal"
                        type="email"
                        variant="outlined"
                        label="Электронная почта"
                        autoComplete="Электронная почта"
                        required
                        fullWidth

                        error={Boolean(formValues.errors.email)}
                        helperText={formValues.errors.email ? formValues.errors.email : null}
                        value={formValues.values.email}

                        onChange={e => onChange("email", e.target.value, validateEmail)}
                    />
                </Grid>

                <Grid item xs={12}>
                    <PhoneInput
                        country="ru"
                        inputProps={{
                            id: "phone",
                            name: "Телефон",
                            type: "tel",
                            required: true
                        }}
                        placeholder="Телефон"
                        searchPlaceholder="Поиск"
                        searchNotFound="Совпадений нет"
                        containerClass={`phone-input ${formValues.errors.phone ? "phone-input__error" : ""}`}
                        specialLabel="Телефон * "
                        value={formValues.values.phone}

                        onChange={value => onChange("phone", value, validatePhone)}
                    />
                    <div className="phone-text__error">
                        {formValues.errors.phone ? formValues.errors.phone : null}
                    </div>
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        id="password"
                        name="password"
                        margin="normal"
                        type="password"
                        variant="outlined"
                        label="Пароль"
                        autoComplete="Пароль"
                        required
                        fullWidth

                        error={Boolean(formValues.errors.password)}
                        helperText={formValues.errors.password ? formValues.errors.password : null}
                        value={formValues.values.password}

                        onChange={e => onChange("password", e.target.value, validatePassword, "passwordConfirm")}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        id="passwordConfirm"
                        name="passwordConfirm"
                        margin="normal"
                        type="password"
                        variant="outlined"
                        label="Повторите пароль"
                        autoComplete="Повторите пароль"
                        required
                        fullWidth

                        error={Boolean(formValues.errors.passwordConfirm)}
                        helperText={formValues.errors.passwordConfirm ? formValues.errors.passwordConfirm : null}
                        value={formValues.values.passwordConfirm}

                        onChange={checkPassword}
                    />
                </Grid>
            </Grid>
        </Box>
    );
});