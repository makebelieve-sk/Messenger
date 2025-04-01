import { memo } from "react";
import { useTranslation } from "react-i18next";

import MenuItemComponent from "@components/ui/menuItem";
import BoxComponent from "@components/ui/box";
import TextFieldComponent from "@components/ui/textField";
import DatePickerComponent from "@modules/edit/date-picker";
import SelectComponent from "@components/ui/select";
import { ITabModule } from "@modules/edit";

import "./main.scss";

export default memo(function Main({ formValues, formErrors, onChange }: ITabModule) {
	const { t } = useTranslation();

	const onChangeField = (field: string, value: string | null) => {
		onChange(field, value);
	};

	return (
		<>
			<TextFieldComponent
				id="name"
				name="name"
				margin="normal"
				variant="outlined"
				label={t("edit_tabs.name")}
				autoComplete={t("edit_tabs.name")}
				fullWidth
				value={formValues.name}
				required
				autoFocus
				error={Boolean(formErrors && formErrors.name)}
				helperText={
					formErrors && formErrors.name
						? formErrors.name
						: null
				}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeField("name", e.target.value)}
			/>

			<TextFieldComponent
				id="surName"
				name="surName"
				margin="normal"
				variant="outlined"
				label={t("edit_tabs.surname")}
				autoComplete={t("edit_tabs.surname")}
				fullWidth
				value={formValues.surName}
				required
				error={Boolean(formErrors && formErrors.surName)}
				helperText={
					formErrors && formErrors.surName
						? formErrors && formErrors.surName
						: null
				}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeField("surName", e.target.value)}
			/>

			<BoxComponent className="edit-container__sex-select">
				<SelectComponent
					text={t("edit_tabs.sex")}
					labelId="sex-input"
					id="sex-select"
					value={formValues.sex}
					onChange={(e) => onChangeField("sex", e.target.value)}
				>
					<MenuItemComponent value="">
						{t("edit_tabs.sex_not_specified")}
					</MenuItemComponent>
					<MenuItemComponent value={t("edit_tabs.sex_male")}>
						{t("edit_tabs.sex_male")}
					</MenuItemComponent>
					<MenuItemComponent value={t("edit_tabs.sex_female")}>
						{t("edit_tabs.sex_female")}
					</MenuItemComponent>
				</SelectComponent>
			</BoxComponent>

			<DatePickerComponent
				formValues={formValues}
				onChangeField={onChangeField}
			/>

			<TextFieldComponent
				id="work"
				name="work"
				margin="normal"
				variant="outlined"
				label={t("edit_tabs.work")}
				autoComplete={t("edit_tabs.work")}
				fullWidth
				value={formValues.work}
				className={"edit-container__work"}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeField("work", e.target.value)}
			/>
		</>
	);
});