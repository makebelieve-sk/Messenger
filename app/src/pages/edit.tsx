import { FormEvent, SyntheticEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import BoxComponent from "@components/ui/Box";
import AlertComponent from "@components/ui/alert";
import ButtonComponent from "@components/ui/Button";
import SpinnerComponent from "@components/ui/spinner";
import PaperComponent from "@components/ui/Paper";
import EditTabsModule from "@modules/edit";
import useMainClient from "@hooks/useMainClient";
import useUserDetails from "@hooks/useUserDetails";
import useProfile from "@hooks/useProfile";
import useUser from "@hooks/useUser";
import { REQUIRED_FIELD } from "@utils/constants";
import { ProfileEvents, UserDetailsEvents } from "@custom-types/events";

import "@styles/pages/edit.scss";

export interface IFormValues {
	name: string;
	surName: string;
	sex: string;
	birthday: string | null;
	work: string;
	city: string;
	phone: string;
	email: string;
};

export interface IFormErrors {
	name?: string;
	surName?: string;
	phone?: string;
	email?: string;
};

export default function Edit() {
	const [tab, setTab] = useState(0);
	const [loadingSaveBtn, setLoadingSaveBtn] = useState(false);
	const [showAlert, setShowAlert] = useState(false);
	const [formValues, setFormValues] = useState<IFormValues>({
		name: "",
		surName: "",
		sex: "",
		birthday: "",
		work: "",
		city: "",
		phone: "",
		email: "",
	});
	const [formErrors, setFormErrors] = useState<IFormErrors | null>({});
	const [saveDisabled, setSaveDisabled] = useState(false);
	const [loading, setLoading] = useState(false);

	const mainClient = useMainClient();
	const profile = useProfile();
	const userDetails = useUserDetails();
	const user = useUser();
	const { t } = useTranslation();

	const REQUIRED_FIELDS = ["name", "surName", "phone", "email"];

	// Подписываемся на события сущностей
	useEffect(() => {
		userDetails.on(UserDetailsEvents.UPDATE, handleSetFormValues);
		userDetails.on(UserDetailsEvents.SET_LOADING, handleOnLoading);
		profile.on(UserDetailsEvents.SET_LOADING, handleOnLoadingSaveBtn);

		profile.on(ProfileEvents.SET_ALERT, () => setShowAlert(true));

		// Добавляем проверку на то, чтобы не было пустых полей при монтировании
		if (userDetails.details) {
			handleSetFormValues();
		}

		return () => {
			userDetails.off(UserDetailsEvents.UPDATE, handleSetFormValues);
			userDetails.off(UserDetailsEvents.SET_LOADING, handleOnLoading);
			userDetails.off(UserDetailsEvents.SET_LOADING, handleOnLoadingSaveBtn);

			profile.off(ProfileEvents.SET_ALERT, () => setShowAlert(true));
		};
	}, []);

	// Установка disabled кнопке "Сохранить"
	useEffect(() => {
		setSaveDisabled(
			loadingSaveBtn || 
			Boolean(formErrors && Object.values(formErrors).some(Boolean))
		);
	}, [loadingSaveBtn, formValues]);

	// Обработчик на событие UserDetailsEvents.UPDATE
	const handleSetFormValues = () => {
		setFormValues({
			name: user.firstName,
			surName: user.thirdName,
			sex: userDetails.details.sex,
			birthday: userDetails.details.birthday,
			work: userDetails.details.work,
			city: userDetails.details.city,
			phone: user.phone,
			email: user.email,
		});
	}

	// Обработчик на событие UserDetailsEvents.UPDATE
	const handleOnLoading = (isLoading: boolean) => setLoading(isLoading);

	// Обработчик на событие UserDetailsEvents.SET_LOADING
	const handleOnLoadingSaveBtn = (isLoading: boolean) => setLoadingSaveBtn(isLoading);

	// Обработка смены вкладки
	const onChangeTab = (_: SyntheticEvent, newValue: number) => {
		setTab(newValue);
		setShowAlert(false);
	};

	// Обработка изменения значения поля формы
	const onChange = (field: string, value: string | null) => {
		setFormValues({
			...formValues,
			[field]: value,
		});

		if (REQUIRED_FIELDS.includes(field)) {
			setFormErrors({
				[field]: value ? "" : REQUIRED_FIELD
			});
		}
	};

	// Обработка кнопки "Сохранить"
	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		try {
			event.preventDefault();

			if (!formValues || saveDisabled) {
				mainClient.catchErrors(t("edit.error.no_user"));
				return;
			}

			profile.editInfo(formValues);
		} catch (error) {
			setLoadingSaveBtn(false);
			mainClient.catchErrors(t("edit.error.change_user_info") + error);
		}
	};

	return <PaperComponent className={"edit-container"}>
		<Tabs
			orientation="vertical"
			value={tab}
			onChange={onChangeTab}
			aria-label="Edit tabs"
			className={"edit-container__tabs"}
		>
			<Tab
				label={t("edit.main")}
				id="main"
				aria-controls="main"
				disabled={loadingSaveBtn}
				className={"edit-container__tab-name"}
			/>
			<Tab
				label={t("edit.contacts")}
				id="contacts"
				aria-controls="contacts"
				disabled={loadingSaveBtn}
				className={"edit-container__tab-name"}
			/>
		</Tabs>

		<div className={"edit-container__module"}>
			<BoxComponent component="form" noValidate onSubmit={onSubmit}>
				{loading
				 	? <SpinnerComponent />
					: <EditTabsModule
						tab={tab}
						formValues={formValues}
						formErrors={formErrors}
						onChange={onChange}
					/>
				}

				<ButtonComponent
					fullWidth
					type="submit"
					variant="contained"
					className={"edit-container__module__loading-button"}
					loading={loadingSaveBtn}
					disabled={saveDisabled}
				>
					Сохранить
				</ButtonComponent>

				{showAlert 
					? <AlertComponent show={showAlert}>
							<>
								<b>{t("edit.save")}</b> - {t("edit.show_data")}
							</>
						</AlertComponent>
					: null
				}
			</BoxComponent>
		</div>
	</PaperComponent>
}