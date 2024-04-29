import * as React from "react";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Stepper, Step, StepLabel, Button } from "@mui/material";
import { MainClientContext } from "../components/App";
import SignUpForm from "../modules/SignUp/Form";
import ChooseAvatar from "../modules/SignUp/ChooseAvatar";
import Copyright from "../components/Copyright";
import { ApiRoutes, Pages } from "../types/enums";
import { IUser } from "../types/models.types";
import { useAppDispatch } from "../hooks/useGlobalState";
import { setUser } from "../state/user/slice";

const THEME = createTheme();
const steps = ["Основные данные", "Выбор аватара"];

const initialValues = {
    values: {
        firstName: "",
        thirdName: "",
        email: "",
        phone: "",
        password: "",
        passwordConfirm: "",
        avatarUrl: ""
    },
    errors: {
        firstName: "",
        thirdName: "",
        email: "",
        phone: "",
        password: "",
        passwordConfirm: "",
        avatarUrl: ""
    }
};

export interface ISignUpState {
    values: {
        firstName: string;
        thirdName: string;
        email: string;
        phone: string;
        password: string;
        passwordConfirm: string;
        avatarUrl: string;
    };
    errors: {
        firstName: string;
        thirdName: string;
        email: string;
        phone: string;
        password: string;
        passwordConfirm: string;
        avatarUrl: string;
    };
};

export default function SignUp() {
    const [activeStep, setActiveStep] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [formValues, setFormValues] = React.useState(initialValues);

    const mainClient = React.useContext(MainClientContext);
    
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleNext = () => {
        if (activeStep + 1 === steps.length) {
            handleSubmit();
        } else {
            setActiveStep(prevActiveStep => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    const checkValidation = (step: number) => {
        switch (step) {
            case 0:                
                return Object.values(formValues.errors).some(Boolean) || Object.values(formValues.values).map((field, index) => field === "" && index !== 6).some(Boolean);
            default:
                return false;
        }
    };

    const onChange = (field: string, value: string, validateCallback?: (value: string) => string, anotherField?: string) => {
        let hasError = "";

        if (validateCallback) {
            hasError = validateCallback(value);

            if (hasError) {
                if (anotherField) {
                    setFormValues({
                        values: { ...formValues.values, [field]: value },
                        errors: { ...formValues.errors, [field]: hasError, [anotherField]: hasError }
                    });
                } else {
                    setFormValues({
                        values: { ...formValues.values, [field]: value },
                        errors: { ...formValues.errors, [field]: hasError }
                    });
                }
            }
        }

        if (!hasError) {
            if (anotherField) {
                setFormValues({
                    values: { ...formValues.values, [field]: value },
                    errors: { ...formValues.errors, [field]: hasError, [anotherField]: "" }
                });
            } else {
                setFormValues({
                    values: { ...formValues.values, [field]: value },
                    errors: { ...formValues.errors, [field]: "" }
                });
            }
        }
    };

    const handleSubmit = async () => {
        formValues.values.phone = formValues.values.phone
            .replace(/\s/g, "")
            .replace("(", "")
            .replace(")", "");

        const user: Omit<IUser, "id" | "secondName" | "salt"> = {
            firstName: formValues.values.firstName,
            thirdName: formValues.values.thirdName,
            email: formValues.values.email,
            phone: formValues.values.phone,
            password: formValues.values.password,
            avatarUrl: formValues.values.avatarUrl
        };

        mainClient.postRequest(
            ApiRoutes.signUp, 
            user, 
            setLoading, 
            (data: { success: boolean, user: IUser }) => {
                dispatch(setUser(data.user));

                mainClient.postRequest(
                    ApiRoutes.uploadAvatar, 
                    { avatarUrl: user.avatarUrl },
                    undefined,
                    () => navigate(Pages.profile)
                );
            },
            undefined,
            undefined,
            undefined,
            (error) => {
                if (error && typeof error === "object" && error.message) {
                    setActiveStep(0);
                    setFormValues({
                        ...formValues,
                        errors: { ...formValues.errors, [error.field as string]: error.message }
                    });
                }
            }
        );
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <SignUpForm 
                    formValues={formValues} 
                    setFormValues={setFormValues} 
                    onChange={onChange} 
                />;
            case 1:
                return <ChooseAvatar 
                    username={formValues.values.firstName + " " + formValues.values.thirdName} 
                    initialAvatarUrl={formValues.values.avatarUrl} 
                    onChange={onChange} 
                />;
            default:
                return "Неизвестный шаг";
        }
    };

    return (
        <ThemeProvider theme={THEME}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box component="form" noValidate sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                        <LockOutlinedIcon />
                    </Avatar>

                    <Typography component="h1" variant="h5">
                        Регистрация
                    </Typography>

                    <Grid container justifyContent="center" sx={{ mb: 3 }}>
                        <Grid item>
                            <Link href={Pages.signIn} variant="body2" onClick={() => navigate(Pages.signIn)}>
                                Уже есть аккаунт? Войдите
                            </Link>
                        </Grid>
                    </Grid>

                    <Stepper activeStep={activeStep}>
                        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                    </Stepper>

                    {getStepContent(activeStep)}

                    <Box sx={{ display: "flex", flexDirection: "row", pt: 3 }}>
                        <Button fullWidth sx={{ mr: 1 }} disabled={activeStep === 0} onClick={handleBack}>
                            Назад
                        </Button>

                        <LoadingButton
                            fullWidth
                            variant="contained"
                            sx={{ ml: 1, width: "250%" }}
                            loading={loading}
                            color="primary"
                            disabled={checkValidation(activeStep)}
                            onClick={handleNext}
                        >
                            {activeStep === steps.length - 1 ? "Зарегистрироваться" : "Далее"}
                        </LoadingButton>
                    </Box>
                </Box>

                <Copyright />
            </Container>
        </ThemeProvider>
    );
};