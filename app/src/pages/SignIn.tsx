import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { LoadingButton } from "@mui/lab";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import CopyrightComponent from "../components/ui/Copyright";
import LinkComponent from "../components/ui/Link";
import { Pages } from "../types/enums";
import { REQUIRED_FIELD } from "../utils/constants";
import { MainClientContext } from "../components/main/Main";

import styles from "../styles/pages/sign-in.module.scss";

const initialValues = {
	values: {
		login: "",
		password: "",
		rememberMe: false,
	},
	errors: {
		login: "",
		password: "",
		rememberMe: "",
	},
};

export default function SignIn() {
	const [saveDisabled, setSaveDisabled] = useState(true);
	const [loading, setLoading] = useState(false);
	const [errorFromServer, setErrorFromServer] = useState(false);
	const [formValues, setFormValues] = useState(initialValues);

	const mainClient = useContext(MainClientContext);

	const { t } = useTranslation();
	const navigate = useNavigate();

	useEffect(() => {
		setSaveDisabled(disableSave());
	}, [loading, formValues]);

	const disableSave = () => {
		return (
			loading ||
			!formValues.values.login ||
			!formValues.values.password ||
			Object.values(formValues.errors).some(Boolean)
		);
	};

	// Изменение поля
	const onChange = (field: string, value: string | boolean) => {
		setFormValues({
			values: { ...formValues.values, [field]: value },
			errors: errorFromServer
				? { ...initialValues.errors }
				: {
					...formValues.errors,
					[field]: value ? "" : REQUIRED_FIELD,
				},
		});
		setErrorFromServer(false);
	};

	// Отправка формы
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!saveDisabled) {
			mainClient.mainApi.signIn(formValues.values, setLoading, (error) => {
				if (error && typeof error === "object" && error.message) {
					setErrorFromServer(true);
					setFormValues({
						...formValues,
						errors: {
							...formValues.errors,
							login: error.message,
							password: error.message,
						},
					});
				}
			});
		}
	};

	return (
		<Grid container component="main" className={styles.mainGrid}>
			<CssBaseline />
			<Grid className={styles.background} item xs={false} sm={4} md={7} />

			<Grid
				item
				xs={12}
				sm={8}
				md={5}
				component={Paper}
				elevation={6}
				square
			>
				<Box className={styles.signInForm}>
					<Avatar className={styles.avatar}>
						<LockOutlinedIcon />
					</Avatar>

					<Typography component="h1" variant="h5">
						{ t("sign-in.sign_in") }
					</Typography>

					<Box
						noValidate
						component="form"
						onSubmit={handleSubmit}
						className={styles.layoutInput}
					>
						<TextField
							id="login"
							name="login"
							margin="normal"
							variant="outlined"
							label={t("sign-in.login")}
							autoComplete={t("sign-in.login")}
							required
							fullWidth
							autoFocus
							error={Boolean(formValues.errors.login)}
							helperText={formValues.errors.login
								? formValues.errors.login
								: null
							}
							onChange={e => onChange("login", e.target.value)}
						/>

						<TextField
							id="password"
							name="password"
							type="password"
							margin="normal"
							variant="outlined"
							label={t("sign-in.password")}
							autoComplete={t("sign-in.password")}
							required
							fullWidth
							error={Boolean(formValues.errors.password)}
							helperText={formValues.errors.password
								? formValues.errors.password
								: null
							}
							onChange={e => onChange("password", e.target.value)}
						/>

						<FormControlLabel
							label={t("sign-in.remember_me")}
							control={
								<Checkbox
									value={false}
									color="primary"
									onChange={e => onChange("rememberMe", e.target.checked)}
								/>
							}
						/>

						<LoadingButton
							fullWidth
							type="submit"
							variant="contained"
							className={styles.loadingButton}
							loading={loading}
							disabled={saveDisabled}
						>
							{ t("sign-in.enter") }
						</LoadingButton>

						<Grid container>
							<Grid item xs>
								<LinkComponent
									component="p"
									variant="body2"
									className={styles.secondaryButton}
									onClick={() => navigate(Pages.resetPassword)}
								>
									{ t("sign-in.forgot_password") }
								</LinkComponent>
							</Grid>

							<Grid item>
								<LinkComponent
									component="p"
									variant="body2"
									className={styles.secondaryButton}
									onClick={() => navigate(Pages.signUp)}
								>
									{ t("sign-in.register") }
								</LinkComponent>
							</Grid>
						</Grid>
					</Box>

					<CopyrightComponent />
				</Box>
			</Grid>
		</Grid>
	);
}
