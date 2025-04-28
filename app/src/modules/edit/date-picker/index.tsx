import dayjs, { Dayjs } from "dayjs";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import LazyDatePicker from "@components/ui/date-picker";
import { IFormValues } from "@pages/Edit";
import { formattedValue } from "@utils/date";

import "./date-picker.scss";

interface IDatePicker {
	formValues: IFormValues;
	onChangeField: (field: string, value: string | null) => void;
};

export default memo(function DatePickerComponent({ formValues, onChangeField }: IDatePicker) {
	const { t } = useTranslation();

	return <LazyDatePicker
		label={t("edit_tabs.birthday")}
		value={dayjs(formValues.birthday)}
		placeholder={t("edit_tabs.birthday_date")}
		onChange={(newValue: Dayjs | null) => {
			onChangeField("birthday", formattedValue(newValue));
		}}
	/>
});