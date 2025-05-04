import dayjs, { type Dayjs } from "dayjs";
import { memo } from "react";

import LazyDatePicker from "@components/ui/date-picker";
import { type IFormValues } from "@pages/Edit";
import i18next from "@service/i18n";
import { formattedValue } from "@utils/date";

import "./date-picker.scss";

interface IDatePicker {
	formValues: IFormValues;
	onChangeField: (field: string, value: string | null) => void;
};

// Компонент датапикера на вкладке "Основное" на странице редактирования
export default memo(function DatePickerComponent({ formValues, onChangeField }: IDatePicker) {
	return <LazyDatePicker
		label={i18next.t("edit_tabs.birthday")}
		value={dayjs(formValues.birthday)}
		placeholder={i18next.t("edit_tabs.birthday_date")}
		onChange={(newValue: Dayjs | null) => {
			onChangeField("birthday", formattedValue(newValue));
		}}
	/>;
});