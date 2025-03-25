import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoadingButton } from "@mui/lab";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TypographyComponent from "@components/ui/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";

import i18next from "@service/i18n";
import LinkComponent from "@components/ui/link";
import SignUpForm from "@modules/sign-up/Form";
import ChooseAvatar from "@modules/sign-up/ChooseAvatar";
import CopyrightComponent from "@components/ui/copyright";
import useMainClient from "@hooks/useMainClient";
import { Pages } from "@custom-types/enums";
import { IUser } from "@custom-types/models.types";

import styles from "@styles/pages/sign-up.module.scss";

const THEME = createTheme();
const steps = [i18next.t("sign-up.main_step"), i18next.t("sign-up.choose_avatar_step")];

const initialValues = {
	values: {
		firstName: "",
		thirdName: "",
		email: "",
		phone: "",
		password: "",
		passwordConfirm: "",
		avatarUrl: "",
	},
	errors: {
		firstName: "",
		thirdName: "",
		email: "",
		phone: "",
		password: "",
		passwordConfirm: "",
		avatarUrl: "",
	},
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
	const [activeStep, setActiveStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [formValues, setFormValues] = useState(initialValues);

	const mainClient = useMainClient();
	const { t } = useTranslation();
	const navigate = useNavigate();

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
				return (
					Object.values(formValues.errors).some(Boolean) ||
					Object.values(formValues.values)
						.map((field, index) => field === "" && index !== 6)
						.some(Boolean)
				);
			default:
				return false;
		}
	};

	const onChange = (
		field: string,
		value: string,
		validateCallback?: (value: string) => string,
		anotherField?: string
	) => {
		let hasError = "";

		if (validateCallback) {
			hasError = validateCallback(value);

			if (hasError) {
				if (anotherField) {
					setFormValues({
						values: { ...formValues.values, [field]: value },
						errors: {
							...formValues.errors,
							[field]: hasError,
							[anotherField]: hasError,
						},
					});
				} else {
					setFormValues({
						values: { ...formValues.values, [field]: value },
						errors: { ...formValues.errors, [field]: hasError },
					});
				}
			}
		}

		if (!hasError) {
			if (anotherField) {
				setFormValues({
					values: { ...formValues.values, [field]: value },
					errors: {
						...formValues.errors,
						[field]: hasError,
						[anotherField]: "",
					},
				});
			} else {
				setFormValues({
					values: { ...formValues.values, [field]: value },
					errors: { ...formValues.errors, [field]: "" },
				});
			}
		}
	};

	const handleSubmit = () => {
		formValues.values.phone = formValues.values.phone
			.replace(/\s/g, "")
			.replace("(", "")
			.replace(")", "");

		const user: Omit<IUser, "id" | "secondName" | "salt"> & { password: string } = {
			firstName: formValues.values.firstName,
			thirdName: formValues.values.thirdName,
			email: formValues.values.email,
			phone: formValues.values.phone,
			password: formValues.values.password,
			avatarUrl: formValues.values.avatarUrl,
		};

		mainClient.mainApi.signUp(user, setLoading, (error) => {
			if (error && typeof error === "object" && error.message) {
				setActiveStep(0);
				setFormValues({
					...formValues,
					errors: {
						...formValues.errors,
						[error.field as string]: error.message,
					},
				});
			}
		});
	};

	const getStepContent = (step: number) => {
		switch (step) {
			case 0:
				return (
					<SignUpForm
						formValues={formValues}
						setFormValues={setFormValues}
						onChange={onChange}
					/>
				);
			case 1:
				return (
					<ChooseAvatar
						username={
							formValues.values.firstName +
							" " +
							formValues.values.thirdName
						}
						avatarUrl={formValues.values.avatarUrl}
						onChange={onChange}
					/>
				);
			default:
				mainClient.catchErrors(t("sign-up.error.step_unknowed", { step }));
				return;
		}
	};

	return (
		<ThemeProvider theme={THEME}>
			<Container component="main" maxWidth="xs">
				<CssBaseline />
				<Box component="form" noValidate className={styles.signUpForm}>
					<Avatar className={styles.avatar}>
						<LockOutlinedIcon />
					</Avatar>

					<TypographyComponent
						className={styles.title}
						component="h1"
						variant="h5"
					>
						{t("sign-up.sign_up")}
					</TypographyComponent>

					<Grid
						container
						justifyContent="center"
						className={styles.signInArea}
					>
						<Grid item>
							<LinkComponent
								variant="body2"
								className={styles.secondaryButton}
								onClick={() => navigate(Pages.signIn)}
								component="p"
							>
								{t("sign-up.enter")}
							</LinkComponent>
						</Grid>
					</Grid>

					<Stepper activeStep={activeStep}>
						{steps.map(label => <Step key={label}>
							<StepLabel>{label}</StepLabel>
						</Step>
						)}
					</Stepper>

					{getStepContent(activeStep)}

					<Box className={styles.footerButtonArea}>
						<Button
							fullWidth
							className={styles.backButton}
							disabled={activeStep === 0}
							onClick={handleBack}
						>
							{t("sign-up.back")}
						</Button>

						<LoadingButton
							fullWidth
							variant="contained"
							className={styles.loadingButton}
							loading={loading}
							color="primary"
							disabled={checkValidation(activeStep)}
							onClick={handleNext}
						>
							{activeStep === steps.length - 1
								? t("sign-up.register")
								: t("sign-up.further")}
						</LoadingButton>
					</Box>
				</Box>

				<CopyrightComponent />
			</Container>
		</ThemeProvider>
	);
}
