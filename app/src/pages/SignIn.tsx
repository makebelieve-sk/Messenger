import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LockIconComponent from "@components/icons/lockIcon";
import SystemAvatarComponent from "@components/ui/avatar/system-avatar";
import BoxComponent from "@components/ui/box";
import ButtonComponent from "@components/ui/button";
import CheckboxComponent from "@components/ui/checkbox";
import CopyrightComponent from "@components/ui/copyright";
import GridComponent from "@components/ui/grid";
import LinkComponent from "@components/ui/link";
import PaperComponent from "@components/ui/paper";
import TextFieldComponent from "@components/ui/text-field";
import TypographyComponent from "@components/ui/typography";
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

	return <GridComponent container component="main" className={styles.mainGrid}>
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
				<SystemAvatarComponent>
					<LockIconComponent size={25} />
				</SystemAvatarComponent>

				<TypographyComponent component="h1" variant="h5">
					{i18next.t("sign-in.sign_in")}
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
						label={i18next.t("sign-in.login")}
						autoComplete={i18next.t("sign-in.login")}
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
						label={i18next.t("sign-in.password")}
						autoComplete={i18next.t("sign-in.password")}
						required
						fullWidth
						error={Boolean(formValues.errors.password)}
						helperText={formValues.errors.password
							? formValues.errors.password
							: null
						}
						onChange={e => onChange("password", e.target.value)}
					/>

					<BoxComponent className={styles.signInForm__checkbox}>
						<CheckboxComponent
							value={false}
							id="rememberMe"
							color="primary"
							onChange={e => onChange("rememberMe", e.target.checked)} />
						<label className={styles.signInForm__checkbox__label} htmlFor="rememberMe">{i18next.t("sign-in.remember_me")}</label>
					</BoxComponent>

					<ButtonComponent
						fullWidth
						type="submit"
						variant="contained"
						className={styles.loadingButton}
						loading={loading}
						disabled={saveDisabled}
					>
						{i18next.t("sign-in.enter")}
					</ButtonComponent>

					<GridComponent container className={styles.signInHelp__grid}>
						<GridComponent className={styles.signInForget__grid}>
							<LinkComponent
								component="p"
								variant="body2"
								className={styles.secondaryButton}
								onClick={() => navigate(Pages.resetPassword)}
							>
								{i18next.t("sign-in.forgot_password")}
							</LinkComponent>
						</GridComponent>

						<GridComponent className={styles.signInNoAccount__grid}>
							<LinkComponent
								component="p"
								variant="body2"
								className={styles.secondaryButton}
								onClick={() => navigate(Pages.signUp)}
							>
								{i18next.t("sign-in.register")}
							</LinkComponent>
						</GridComponent>
					</GridComponent>
				</BoxComponent>

				<CopyrightComponent />
			</BoxComponent>
		</GridComponent>
	</GridComponent>;
}
