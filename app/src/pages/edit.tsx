import { FormEvent, SyntheticEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { LoadingButton } from "@mui/lab";
import dayjs, { Dayjs } from "dayjs";

import EditTabsModule from "../modules/edit";
import AlertComponent from "../components/ui/alert";
import SpinnerComponent from "@components/ui/spinner";
import useMainClient from "@hooks/useMainClient";
import useUserDetails from "@hooks/useUserDetails";
import useProfile from "@hooks/useProfile";
import useUser from "@hooks/useUser";
import { REQUIRED_FIELD } from "@utils/constants";
import {formattedValue} from  "@utils/date";
import { UserDetailsEvents } from "@custom-types/events";

import "../styles/pages/edit.scss";

export interface IFormValues {
	name: string;
	surName: string;
	sex: string;
	birthday: dayjs.Dayjs | string | null;
	work: string;
	city: string;
	phone: string;
	email: string;
}

export interface IFormErrors {
	name?: string;
	surName?: string;
	phone?: string;
	email?: string;
}

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

	// Отлавливаем событие апдейт и отписываемся от него так же делаем проверку на наличие данных чтобы не было пустых полей 
	useEffect(() => {
		userDetails.on(UserDetailsEvents.UPDATE, () => {
			handleSetFormValues();
		});

		if (userDetails.details) {
			handleSetFormValues();
		}

		return () => {
			userDetails.off(UserDetailsEvents.UPDATE, () => {
			handleSetFormValues();
			});
		};
	}, []);

	// Установка disabled кнопке "Сохранить"
	useEffect(() => {
		setSaveDisabled(
			loadingSaveBtn ||
				Boolean(formErrors && Object.values(formErrors).some(Boolean))
		);
	}, [loadingSaveBtn, formValues]);

	const onChangeTab = (_: SyntheticEvent, newValue: number) => {
		setTab(newValue);
		setShowAlert(false);
	};

	const onChange = (
		field: string,
		value: string | boolean | Date | null | Dayjs
	) => {
		if (formValues) {
			setFormValues({
				...formValues,
				[field]: value,
			});

			if (REQUIRED_FIELDS.includes(field)) {
				setFormErrors({
					[field]: value ? "" : REQUIRED_FIELD,
				});
			}
		}
	};

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		try {
			event.preventDefault();

			if (formValues && !saveDisabled) {
				const result = {
					...formValues,
					userId: profile.user.id,
				};

				if (
					result["birthday"] &&
					typeof result["birthday"] !== "string"
				) {
					result["birthday"] = formattedValue(result["birthday"]);
				}

				profile.editInfo({
					result,
					setShowAlert,
				});
			} else {
				mainClient.catchErrors(t("edit.error.no_user"));
			}
		} catch (error) {
			setLoadingSaveBtn(false);
			mainClient.catchErrors(t("edit.error.change_user_info") + error);
		}
	};

	const handleOnLoading = (isLoading: boolean) => setLoading(isLoading);

	//подписка на событие лоадинг
	useEffect(() => {
		userDetails.on(UserDetailsEvents.SET_LOADING, handleOnLoading);

		return () => {
			userDetails.off(UserDetailsEvents.SET_LOADING, handleOnLoading);
		};
	}, []);

	const handleOnLoadingSaveBtn = (isLoading: boolean) => setLoadingSaveBtn(isLoading);

	useEffect(() => {
		profile.on(UserDetailsEvents.SET_LOADING, handleOnLoadingSaveBtn);

		return () => {
			profile.off(UserDetailsEvents.SET_LOADING, handleOnLoadingSaveBtn);
		};
	}, []);

	return (
		<Paper className={"edit-container"}>
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
				<Box component="form" noValidate onSubmit={onSubmit}>
					{loading ? 
						<SpinnerComponent />
					 : 
						<EditTabsModule
							tab={tab}
							formValues={formValues}
							formErrors={formErrors}
							onChange={onChange}
						/>
					}
					<LoadingButton
						fullWidth
						type="submit"
						variant="contained"
						className={"edit-container__module__loading-button"}
						loading={loadingSaveBtn}
						disabled={saveDisabled}
					>
						Сохранить
					</LoadingButton>

					{showAlert ? 
						<AlertComponent show={showAlert}>
							<>
								<b>{t("edit.save")}</b> - {t("edit.show_data")}
							</>
						</AlertComponent>
					 : null}
				</Box>
			</div>
		</Paper>
	);
}
