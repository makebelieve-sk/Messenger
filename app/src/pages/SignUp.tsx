import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LockIconComponent from "@components/icons/lock";
import SystemAvatarComponent from "@components/services/avatars/system-avatar";
import BoxComponent from "@components/ui/box";
import ButtonComponent from "@components/ui/button";
import { type IUpdatedAvatar } from "@components/ui/change-avatar";
import CopyrightComponent from "@components/ui/copyright";
import GridComponent from "@components/ui/grid";
import LinkComponent from "@components/ui/link";
import StepperComponent from "@components/ui/stepper";
import TypographyComponent from "@components/ui/typography";
import useMainClient from "@hooks/useMainClient";
import ChooseAvatar from "@modules/sign-up/ChooseAvatar";
import SignUpForm from "@modules/sign-up/Form";
import i18next from "@service/i18n";
import useAuthStore from "@store/auth";
import useUIStore from "@store/ui";
import { HTTPStatuses, Pages } from "@custom-types/enums";
import { type IUser } from "@custom-types/models.types";

import styles from "@styles/pages/sign-up.module.scss";

const steps = [ i18next.t("sign-up.main_step"), i18next.t("sign-up.choose_avatar_step") ];

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

export interface ISignUpErrors {
	status: HTTPStatuses;
	field?: string;
	message?: string;
	fields?: string[];
};

// Страница регистрации
export default function SignUp() {
	const [ activeStep, setActiveStep ] = useState(0);
	const [ formValues, setFormValues ] = useState(initialValues);
	const [ newPhotoUrl, setNewPhotoUrl ] = useState<string | null>(null);

	const signUpErrors = useAuthStore(state => state.signUpErrors);
	const loading = useAuthStore(state => state.signUpLoading);

	const mainClient = useMainClient();
	const navigate = useNavigate();

	// Подписка на событие ошибок, возникающих при регистрации
	useEffect(() => {
		if (signUpErrors) {
			onSignUpErrors(signUpErrors);
		}
	}, [ signUpErrors ]);

	// Обработка ошибок, которые возвращаются с API
	const onSignUpErrors = ({ status, field, message, fields }: ISignUpErrors) => {
		let errorFields = {};

		/**
		 * Если поле field - то означает, что ошибка пришла с 409 статусом (см. CatchErrors)
		 * Значит это дубликат (конфликтные данные)
		 */
		if (status === HTTPStatuses.Conflict && field) {
			errorFields = {
				[field]: message,
			};
		}

		/**
		 * Если поле fields - то означает, что ошибка пришла с 400 статусом (см. CatchErrors)
		 * Значит это незаполненные данные (обязательные поля не заполнены)
		 */
		if (status === HTTPStatuses.BadRequest && fields) {
			for (const field of fields) {
				errorFields = {
					...errorFields,
					[field]: i18next.t("sign-up.error.required_field"),
				};
			}
		}

		setActiveStep(0);
		setFormValues({
			...formValues,
			errors: {
				...formValues.errors,
				...errorFields,
			},
		});
	};

	const handleNext = () => {
		if (activeStep + 1 === steps.length) {
			handleSubmit();
		} else {
			setActiveStep((prevActiveStep) => prevActiveStep + 1);
		}
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const checkValidation = (step: number) => {
		switch (step) {
		case 0:
			return Object.values(formValues.errors).some(Boolean) ||
				Object
					.values(formValues.values)
					.map((field, index) => field === "" && index !== 6)
					.some(Boolean);
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

	const onChangeAvatar = (field: string, data: IUpdatedAvatar) => {
		const { newAvatar, newPhoto } = data;

		onChange(field, newAvatar.newAvatarUrl);
		setNewPhotoUrl(newPhoto.newPhotoUrl);
	};

	const handleSubmit = () => {
		formValues.values.phone = "+" + formValues.values.phone.replace(/\s/g, "").replace("(", "").replace(")", "");

		const user: Omit<IUser, "id" | "secondName" | "avatarCreateDate" | "fullName"> & { password: string; photoUrl: string | null; } = {
			firstName: formValues.values.firstName,
			thirdName: formValues.values.thirdName,
			email: formValues.values.email,
			phone: formValues.values.phone,
			password: formValues.values.password,
			avatarUrl: formValues.values.avatarUrl,
			photoUrl: newPhotoUrl,
		};

		mainClient.mainApi.signUp(user);
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
				avatarUrl={formValues.values.avatarUrl} 
				onChange={onChange} 
				onChangeAvatar={onChangeAvatar}
			/>;
		default:
			useUIStore.getState().setError(i18next.t("sign-up.error.step_unknowed", { step }));
			return;
		}
	};

	return <BoxComponent className={styles.signUpArea}> 
		<BoxComponent component="form" noValidate className={styles.signUpForm}>
			<SystemAvatarComponent>
				<LockIconComponent size={25} />
			</SystemAvatarComponent>

			<TypographyComponent
				className={styles.title}
				component="h1"
				variant="h5"
			>
				{i18next.t("sign-up.sign_up")}
			</TypographyComponent>

			<GridComponent
				container
				className={styles.signInArea}
			>
				<GridComponent className="toSignIn">
					<LinkComponent
						variant="body2"
						className={styles.secondaryButton}
						onClick={() => navigate(Pages.signIn)}
						component="p"
					>
						{i18next.t("sign-up.enter")}
					</LinkComponent>
				</GridComponent>
			</GridComponent>

			<StepperComponent steps={steps} activeStep={activeStep} />

			{getStepContent(activeStep)}

			<BoxComponent className={styles.footerButtonArea}>
				<ButtonComponent
					fullWidth
					className={styles.backButton}
					disabled={activeStep === 0}
					onClick={handleBack}
				>
					{i18next.t("sign-up.back")}
				</ButtonComponent>

				<ButtonComponent
					fullWidth
					variant="contained"
					className={styles.loadingButton}
					loading={loading}
					color="primary"
					disabled={checkValidation(activeStep)}
					onClick={handleNext}
				>
					{activeStep === steps.length - 1
						? i18next.t("sign-up.register")
						: i18next.t("sign-up.further")}
				</ButtonComponent>
			</BoxComponent>
		</BoxComponent>

		<CopyrightComponent />
	</BoxComponent>;
}
