import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { LoadingButton } from "@mui/lab";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import CopyrightComponent from "@components/ui/copyright";
import LinkComponent from "@components/ui/link";
import useMainClient from "@hooks/useMainClient";
import i18next from "@service/i18n";
import useAuthStore from "@store/auth";
import { Pages } from "@custom-types/enums";
import { REQUIRED_FIELD } from "@utils/constants";
import styles from "@styles/pages/sign-in.module.scss";

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

// Страница входа
export default function SignIn() {
	const [ saveDisabled, setSaveDisabled ] = useState(true);
	const [ errorFromServer, setErrorFromServer ] = useState(false);
	const [ formValues, setFormValues ] = useState(initialValues);

	const signInErrors = useAuthStore(state => state.signInErrors);
	const loading = useAuthStore(state => state.signInLoading);

	const { mainApi } = useMainClient();

	const navigate = useNavigate();

	// Подписка на событие ошибок, возникающих при входе
	useEffect(() => {
		if (signInErrors) {
			onSetSignInErrors();
		}
	}, [ signInErrors ]);

	useEffect(() => {
		setSaveDisabled(disableSave());
	}, [ loading, formValues ]);

	// Обработка ошибок, которые возвращаются с API
	const onSetSignInErrors = () => {
		setErrorFromServer(true);
		setFormValues({
			...formValues,
			errors: {
				...formValues.errors,
				login: i18next.t("sign-in.error.incorrect_login_or_password"),
				password: i18next.t("sign-in.error.incorrect_login_or_password"),
			},
		});
	};

	const disableSave = () => {
		return loading || !formValues.values.login || !formValues.values.password || Object.values(formValues.errors).some(Boolean);
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
		useAuthStore.getState().setSignInErrors(false);
		setErrorFromServer(false);
	};

	// Отправка формы
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!saveDisabled) {
			mainApi.signIn(formValues.values);
		}
	};

	return <Grid container component="main" className={styles.mainGrid}>
		<CssBaseline />
		<Grid className={styles.background} item xs={false} sm={4} md={7} />

		<Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
			<Box className={styles.signInForm}>
				<Avatar className={styles.avatar}>
					<LockOutlinedIcon />
				</Avatar>

				<Typography component="h1" variant="h5">
					{i18next.t("sign-in.sign_in")}
				</Typography>

				<Box noValidate component="form" onSubmit={handleSubmit} className={styles.layoutInput}>
					<TextField
						id="login"
						name="login"
						margin="normal"
						variant="outlined"
						label={i18next.t("sign-in.login")}
						autoComplete={i18next.t("sign-in.login")}
						required
						fullWidth
						autoFocus
						error={Boolean(formValues.errors.login)}
						helperText={formValues.errors.login ? formValues.errors.login : null}
						onChange={(e) => onChange("login", e.target.value)}
					/>

					<TextField
						id="password"
						name="password"
						type="password"
						margin="normal"
						variant="outlined"
						label={i18next.t("sign-in.password")}
						autoComplete={i18next.t("sign-in.password")}
						required
						fullWidth
						error={Boolean(formValues.errors.password)}
						helperText={formValues.errors.password ? formValues.errors.password : null}
						onChange={(e) => onChange("password", e.target.value)}
					/>

					<FormControlLabel
						label={i18next.t("sign-in.remember_me")}
						control={<Checkbox value={false} color="primary" onChange={(e) => onChange("rememberMe", e.target.checked)} />}
					/>

					<LoadingButton fullWidth type="submit" variant="contained" className={styles.loadingButton} loading={loading} disabled={saveDisabled}>
						{i18next.t("sign-in.enter")}
					</LoadingButton>

					<Grid container>
						<Grid item xs>
							<LinkComponent component="p" variant="body2" className={styles.secondaryButton} onClick={() => navigate(Pages.resetPassword)}>
								{i18next.t("sign-in.forgot_password")}
							</LinkComponent>
						</Grid>

						<Grid item>
							<LinkComponent component="p" variant="body2" className={styles.secondaryButton} onClick={() => navigate(Pages.signUp)}>
								{i18next.t("sign-in.register")}
							</LinkComponent>
						</Grid>
					</Grid>
				</Box>

				<CopyrightComponent />
			</Box>
		</Grid>
	</Grid>;
}
