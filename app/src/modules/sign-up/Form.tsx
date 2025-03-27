import { memo, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import type { CountryData } from "react-phone-input-2";

import GridComponent from "@components/ui/Grid";
import TextFieldComponent from "@components/ui/TextField";
import BoxComponent from "@components/ui/Box";
import SpinnerComponent from "@components/ui/spinner";
import { emailCheck } from "@utils/email-check";
import { REQUIRED_FIELD } from "@utils/constants";
import { ISignUpState } from "@pages/SignUp";

import "./sign-up.scss";

// Лениво подгружаем компонент и его стили (так как пакет имеет большой вес)
// Выше импортировали import type - это означает, что типизация не входит в билд клиента, значит, импортируем тип только для разработки
const PhoneInput = lazy(() => {
	import("react-phone-input-2/lib/material.css");
	return import("react-phone-input-2");
});

interface ISignUpForm {
	formValues: ISignUpState;
	setFormValues: React.Dispatch<React.SetStateAction<ISignUpState>>;
	onChange: (
		field: string,
		value: string,
		validateCallback?: (value: string) => string,
		anotherField?: string
	) => void;
}

export default memo(function SignUpForm({
	formValues,
	setFormValues,
	onChange,
}: ISignUpForm) {
	const { t } = useTranslation();

	const checkPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormValues({
			values: {
				...formValues.values,
				passwordConfirm: e.target.value,
			},
			errors: {
				...formValues.errors,
				password:
					e.target.value &&
					e.target.value === formValues.values.password
						? ""
						: e.target.value !== formValues.values.password
							? t("sign-up-module.password_incorrect")
							: REQUIRED_FIELD,
				passwordConfirm:
					e.target.value &&
					e.target.value === formValues.values.password
						? ""
						: e.target.value !== formValues.values.password
							? t("sign-up-module.password_incorrect")
							: REQUIRED_FIELD,
			}
		});
	};

	const validateFullName = (value: string) => {
		return value
			? value.length < 3
				? t("sign-up-module.short_password")
				: ""
			: REQUIRED_FIELD;
	};

	const validateEmail = (value: string) => {
		return value
			? emailCheck(value)
				? ""
				: t("sign-up-module.incorrect_email")
			: REQUIRED_FIELD;
	};

	const validatePhone = (value: string, country: CountryData) => {
		if (value) {
			const numbersCount = value.match(/\d/g);
			const numberLength = country.format.match(/\./g)?.length;
			return numbersCount &&
				numbersCount.length &&
				numbersCount.length !== numberLength
				? t("sign-up-module.phone_length", { length: numberLength })
				: "";
		}

		return REQUIRED_FIELD;
	};

	const validatePassword = (value: string) => {
		return value
			? value === formValues.values.passwordConfirm
				? ""
				: t("sign-up-module.password_incorrect")
			: REQUIRED_FIELD;
	};

	return (
		<BoxComponent className="sign-up-form">
			<GridComponent container spacing={2} className="grid_form">
				<GridComponent xs={12} sm={6}>
					<TextFieldComponent
						id="firstName"
						name="firstName"
						margin="normal"
						variant="outlined"
						label={t("sign-up-module.name")}
						autoComplete={t("sign-up-module.name")}
						required
						fullWidth
						autoFocus
						error={Boolean(formValues.errors.firstName)}
						helperText={formValues.errors.firstName
							? formValues.errors.firstName
							: null
						}
						value={formValues.values.firstName}
						onChange={e => onChange(
							"firstName",
							e.target.value,
							validateFullName
						)}
					/>
				</GridComponent>

				<GridComponent xs={12} sm={6}>
					<TextFieldComponent
						id="thirdName"
						name="thirdName"
						margin="normal"
						variant="outlined"
						label={t("sign-up-module.surName")}
						autoComplete={t("sign-up-module.surName")}
						required
						fullWidth
						error={Boolean(formValues.errors.thirdName)}
						helperText={formValues.errors.thirdName
							? formValues.errors.thirdName
							: null
						}
						value={formValues.values.thirdName}
						onChange={e => onChange(
							"thirdName",
							e.target.value,
							validateFullName
						)}
					/>
				</GridComponent>

				<GridComponent xs={12}>
					<TextFieldComponent
						id="email"
						name="email"
						margin="normal"
						type="email"
						variant="outlined"
						label={t("sign-up-module.email")}
						autoComplete={t("sign-up-module.email")}
						required
						fullWidth
						error={Boolean(formValues.errors.email)}
						helperText={formValues.errors.email
							? formValues.errors.email
							: null
						}
						value={formValues.values.email}
						onChange={e => onChange("email", e.target.value, validateEmail)}
					/>
				</GridComponent>

				<GridComponent xs={12}>
					<Suspense fallback={<div className="phone-input__loading"><SpinnerComponent /></div>}>
						<PhoneInput
							country="ru"
							inputProps={{
								id: "phone",
								name: t("sign-up-module.phone"),
								type: "tel",
								required: true,
							}}
							placeholder={t("sign-up-module.phone")}
							searchPlaceholder={t("sign-up-module.search")}
							searchNotFound={t("sign-up-module.no_coincidences")}
							containerClass={`phone-input ${formValues.errors.phone ? "phone-input__error" : ""}`}
							specialLabel={t("sign-up-module.phone_number")}
							value={formValues.values.phone}
							onChange={(value, country) => onChange("phone", value, () =>
								validatePhone(value, country as CountryData)
							)}
						/>
					</Suspense>
					<div className="phone-text__error">
						{formValues.errors.phone
							? formValues.errors.phone
							: null}
					</div>
				</GridComponent>

				<GridComponent xs={12}>
					<TextFieldComponent
						id="password"
						name="password"
						margin="normal"
						type="password"
						variant="outlined"
						label={t("sign-up-module.password")}
						autoComplete={t("sign-up-module.password")}
						required
						fullWidth
						error={Boolean(formValues.errors.password)}
						helperText={formValues.errors.password
							? formValues.errors.password
							: null
						}
						value={formValues.values.password}
						onChange={e => onChange(
							"password",
							e.target.value,
							validatePassword,
							"passwordConfirm"
						)}
					/>
				</GridComponent>

				<GridComponent xs={12}>
					<TextFieldComponent
						id="passwordConfirm"
						name="passwordConfirm"
						margin="normal"
						type="password"
						variant="outlined"
						label={t("sign-up-module.repeat_password")}
						autoComplete={t("sign-up-module.repeat_password")}
						required
						fullWidth
						error={Boolean(formValues.errors.passwordConfirm)}
						helperText={formValues.errors.passwordConfirm
							? formValues.errors.passwordConfirm
							: null
						}
						value={formValues.values.passwordConfirm}
						onChange={checkPassword}
					/>
				</GridComponent>
			</GridComponent>
		</BoxComponent>
	);
});
