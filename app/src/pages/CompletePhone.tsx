import { useState } from "react";
import { lazy, Suspense } from "react";
import { type CountryData } from "react-phone-input-2";

import LockIconComponent from "@components/icons/lock";
import SystemAvatarComponent from "@components/services/avatars/system-avatar";
import BoxComponent from "@components/ui/box";
import ButtonComponent from "@components/ui/button";
import CopyrightComponent from "@components/ui/copyright";
import GridComponent from "@components/ui/grid";
import SuspenseSpinner from "@components/ui/suspense-spinner";
import TypographyComponent from "@components/ui/typography";
import useMainClient from "@hooks/useMainClient";
import i18next from "@service/i18n";
import { REQUIRED_FIELD } from "@utils/constants";

import styles from "@styles/pages/sign-up.module.scss";

/**
 * Лениво подгружаем компонент и его стили (так как пакет имеет большой вес)
 */
const PhoneInput = lazy(() => {
	import("react-phone-input-2/lib/material.css");
	return import("react-phone-input-2");
});

// Страница завершения регистрации после OAuth - ввод номера телефона
export default function CompletePhone() {
	const [ phone, setPhone ] = useState("");
	const [ phoneError, setPhoneError ] = useState("");
	const [ isSubmitting, setIsSubmitting ] = useState(false);
	const mainClient = useMainClient();

	const validatePhone = (value: string, country: CountryData) => {
		if (value) {
			const numbersCount = value.match(/\d/g);
			const numberLength = country.format.match(/\./g)?.length;

			return numbersCount && numbersCount.length && numbersCount.length !== numberLength 
				? i18next.t("sign-up-module.phone_length", { length: numberLength }) 
				: "";
		}

		return REQUIRED_FIELD;
	};

	const handlePhoneChange = (value: string, country: CountryData) => {
		setPhone(value);
		const error = validatePhone(value, country);
		setPhoneError(error);
	};

	const handleSubmit = () => {
		if (!phone) {
			setPhoneError(REQUIRED_FIELD);
			return;
		}

		// Форматируем телефон в формат E.164
		const formattedPhone = "+" + phone.replace(/\s/g, "").replace("(", "").replace(")", "");
		
		setIsSubmitting(true);
		mainClient.mainApi.completePhone(formattedPhone);
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
				{i18next.t("complete-phone.title")}
			</TypographyComponent>

			<TypographyComponent
				className={styles.subtitle}
				component="p"
				variant="body2"
			>
				{i18next.t("complete-phone.description")}
			</TypographyComponent>

			<GridComponent container spacing={2} className={styles.formContainer}>
				<GridComponent xs={12}>
					<Suspense fallback={<SuspenseSpinner className="sign-up-form__phone-input__loading" />}>
						<PhoneInput
							country="ru"
							inputProps={{
								id: "phone",
								name: i18next.t("sign-up-module.phone"),
								type: "tel",
								required: true,
							}}
							placeholder={i18next.t("sign-up-module.phone")}
							searchPlaceholder={i18next.t("sign-up-module.search")}
							searchNotFound={i18next.t("sign-up-module.no_coincidences")}
							containerClass={`phone-input ${phoneError ? "phone-input__error" : ""}`}
							specialLabel={i18next.t("sign-up-module.phone_number")}
							value={phone}
							onChange={(value, country) => handlePhoneChange(value, country as CountryData)}
						/>
					</Suspense>

					<div className="sign-up-form__phone-error-text">
						{phoneError ? phoneError : null}
					</div>
				</GridComponent>

				<GridComponent xs={12}>
					<BoxComponent className={styles.footerButtonArea}>
						<ButtonComponent
							type="button"
							variant="contained"
							color="primary"
							fullWidth
							disabled={isSubmitting || !!phoneError || !phone}
							onClick={handleSubmit}
						>
							{i18next.t("complete-phone.submit")}
						</ButtonComponent>
					</BoxComponent>
				</GridComponent>
			</GridComponent>

			<CopyrightComponent />
		</BoxComponent>
	</BoxComponent>;
};

