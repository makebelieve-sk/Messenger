import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import useMainClient from "@hooks/useMainClient";
import { Pages } from "@custom-types/enums";
import AvatarComponent from "@components/ui/avatar";
import TextFieldComponent from "@components/ui/textField";
import BoxComponent from "@components/ui/box";
import ButtonComponent from "@components/ui/button";
import TypographyComponent from "@components/ui/typography";
import GridComponent from "@components/ui/grid";
import CopyrightComponent from "@components/ui/copyright";
import LinkComponent from "@components/ui/link";
import PaperComponent from "@components/ui/paper";
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

export default function SignIn() {
	const [saveDisabled, setSaveDisabled] = useState(true);
	const [loading, setLoading] = useState(false);
	const [errorFromServer, setErrorFromServer] = useState(false);
	const [formValues, setFormValues] = useState(initialValues);

	const { mainApi } = useMainClient();

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
			mainApi.signIn(formValues.values, setLoading, (error) => {
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
		<GridComponent container component="main" className={styles.mainGrid}>
			<GridComponent className={styles.background} xs={0} sm={4} md={7} />

			<GridComponent
				xs={12}
				sm={8}
				md={5}
				component={PaperComponent}
				elevation={6}
				square
			>
				<BoxComponent className={styles.signInForm}>
					<AvatarComponent avatarClassName={styles.avatar}>
						<LockOutlinedIcon />
					</AvatarComponent>

					<TypographyComponent component="h1" variant="h5">
						{t("sign-in.sign_in")}
					</TypographyComponent>

					<BoxComponent
						noValidate
						component="form"
						onSubmit={handleSubmit}
						className={styles.layoutInput}
					>
						<TextFieldComponent
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

						<TextFieldComponent
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

						<ButtonComponent
							fullWidth
							type="submit"
							variant="contained"
							className={styles.loadingButton}
							loading={loading}
							disabled={saveDisabled}
						>
							{t("sign-in.enter")}
						</ButtonComponent>

						<GridComponent container className={styles.signInHelp__grid}>
							<GridComponent className={styles.signInForget__grid}>
								<LinkComponent
									component="p"
									variant="body2"
									className={styles.secondaryButton}
									onClick={() => navigate(Pages.resetPassword)}
								>
									{t("sign-in.forgot_password")}
								</LinkComponent>
							</GridComponent>

							<GridComponent className={styles.signInNoAccount__grid}>
								<LinkComponent
									component="p"
									variant="body2"
									className={styles.secondaryButton}
									onClick={() => navigate(Pages.signUp)}
								>
									{t("sign-in.register")}
								</LinkComponent>
							</GridComponent>
						</GridComponent>
					</BoxComponent>

					<CopyrightComponent />
				</BoxComponent>
			</GridComponent>
		</GridComponent>
	);
}
