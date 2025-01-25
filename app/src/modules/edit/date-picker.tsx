import React from "react";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import { IFormValues } from "../../pages/Edit";
import { useTranslation } from "react-i18next";
interface DatePickerComponentProps {
	formValues: IFormValues;
	onChangeField: (
		field: string,
		value: string | boolean | Date | null | Dayjs
	) => void;
}

const formattedValue = (date: Dayjs | null): string | null => {
	return date ? date.format("YYYY-MM-DD") : null;
};

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
	formValues,
	onChangeField,
}) => {
	const { t } = useTranslation();
	return (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
			<DatePicker
				disableFuture
				label={t("edit_tabs.birthday")}
				value={dayjs(formValues.birthday)}
				onChange={(newValue) => {
					onChangeField("birthday", formattedValue(newValue));
				}}
				slotProps={{
					textField: {
						fullWidth: true,
						inputProps: {
							placeholder: t("edit_tabs.birthday_date"),
						},
					},
				}}
			/>
		</LocalizationProvider>
	);
};

export default DatePickerComponent;
