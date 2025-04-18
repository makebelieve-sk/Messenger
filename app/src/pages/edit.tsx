import { FormEvent, SyntheticEvent, useEffect, useState } from "react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import AlertComponent from "@components/ui/alert";
import BoxComponent from "@components/ui/box";
import ButtonComponent from "@components/ui/button";
import PaperComponent from "@components/ui/paper";
import useProfile from "@hooks/useProfile";
import EditTabsModule from "@modules/edit";
import i18next from "@service/i18n";
import useProfileStore from "@store/profile";
import useUserStore from "@store/user";
import { NOT_CORRECT_FORMAT, REQUIRED_FIELD } from "@utils/constants";

import "@styles/pages/edit.scss";

const REQUIRED_FIELDS = [ "name", "surName", "phone", "email" ];

export interface IFormValues {
	name: string;
	surName: string;
	phone: string;
	email: string;
	sex: string;
	birthday: string;
	work: string;
	city: string;
};

export interface IFormErrors {
	name?: string;
	surName?: string;
	phone?: string;
	email?: string;
};

// Страница регистрации
export default function Edit() {
	const showAlert = useProfileStore(state => state.showEditAlert);
	const saveLoading = useProfileStore(state => state.isEditLoading);
	const editErrors = useProfileStore(state => state.editErrors);

	const name = useUserStore(state => state.user.firstName);
	const surName = useUserStore(state => state.user.thirdName);
	const email = useUserStore(state => state.user.email);
	const phone = useUserStore(state => state.user.phone);

	const birthday = useUserStore(state => state.editUserDetails.birthday);
	const city = useUserStore(state => state.editUserDetails.city);
	const work = useUserStore(state => state.editUserDetails.work);
	const sex = useUserStore(state => state.editUserDetails.sex);

	const [ tab, setTab ] = useState(0);
	const [ formValues, setFormValues ] = useState<IFormValues>({
		name,
		surName,
		phone,
		email,
		sex,
		birthday,
		work,
		city,
	});
	const [ formErrors, setFormErrors ] = useState<IFormErrors | null>({});
	const [ saveDisabled, setSaveDisabled ] = useState(false);

	const profile = useProfile();

	// Закрываем AlertComponent (если вдруг был открыт)
	useEffect(() => {
		return () => {
			if (showAlert) onCloseAlert();
		};
	}, [ showAlert ]);

	// Указываем ошибки, пришедшие от сервера, полям в форме редактирования
	useEffect(() => {
		if (editErrors) {
			onSetEditInfoErrors(editErrors);
		}
	}, [ editErrors ]);

	// Установка disabled кнопке "Сохранить"
	useEffect(() => {
		setSaveDisabled(saveLoading || Boolean(formErrors && Object.values(formErrors).some(Boolean)));
	}, [ saveLoading, formValues ]);

	// Обрабатываем ошибки, пришедшие с сервера, при редактировании
	const onSetEditInfoErrors = ({ field, fields }: { field?: string; fields?: string[]; }) => {
		let errorFields = {};

		if (fields && fields.length) {
			for (const field of fields) {
				errorFields = {
					...errorFields,
					[field]: REQUIRED_FIELD,
				};
			}
		}
		
		if (field) {
			errorFields = {
				[field]: NOT_CORRECT_FORMAT,
			};
		}

		setFormErrors({
			...formErrors,
			...errorFields,
		});
	};

	// Обработка смены вкладки
	const onChangeTab = (_: SyntheticEvent, newValue: number) => {
		setTab(newValue);
		useProfileStore.getState().setShowEditAlert(false);
	};

	// Обработка изменения значения поля формы
	const onChange = (field: string, value: string | null) => {
		setFormValues({
			...formValues,
			[field]: value,
		});

		if (REQUIRED_FIELDS.includes(field)) {
			setFormErrors({
				[field]: value ? "" : REQUIRED_FIELD,
			});
		}
	};

	// Обработка кнопки "Сохранить"
	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const processedValues = Object.fromEntries(
			Object.entries(formValues).map(([ key, value ]) => [
				key, 
				value === "" ? null : value,
			]),
		) as IFormValues;

		profile.editInfo(processedValues);
		onCloseAlert();
	};

	// Закрытие AlertComponent
	const onCloseAlert = () => {
		useProfileStore.getState().setShowEditAlert(false);
	};

	return <PaperComponent className="edit-container">
		<Tabs orientation="vertical" value={tab} onChange={onChangeTab} aria-label="Edit tabs" className="edit-container__tabs">
			<Tab label={i18next.t("edit.main")} id="main" aria-controls="main" disabled={saveLoading} className="edit-container__tab-name" />
			<Tab label={i18next.t("edit.contacts")} id="contacts" aria-controls="contacts" disabled={saveLoading} className="edit-container__tab-name" />
		</Tabs>

		<div className="edit-container__module">
			<BoxComponent component="form" noValidate onSubmit={onSubmit}>
				<EditTabsModule tab={tab} formValues={formValues} formErrors={formErrors} onChange={onChange} />

				<ButtonComponent
					fullWidth
					type="submit"
					variant="contained"
					className="edit-container__module__loading-button"
					loading={saveLoading}
					disabled={saveDisabled}
				>
					{i18next.t("edit.save")}
				</ButtonComponent>

				<AlertComponent show={showAlert} onExited={onCloseAlert}>
					<>
						<b>{i18next.t("edit.changes_save")}</b> - {i18next.t("edit.show_data")}
					</>
				</AlertComponent>
			</BoxComponent>
		</div>
	</PaperComponent>;
}
