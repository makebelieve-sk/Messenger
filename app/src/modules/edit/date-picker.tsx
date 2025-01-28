import { FC } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import { useTranslation } from "react-i18next";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { IFormValues } from "@pages/Edit";
import {formattedValue} from "@utils/date";

interface DatePickerComponentProps {
	formValues: IFormValues;
	onChangeField: (
		field: string,
		value: string | boolean | Date | null | Dayjs
	) => void;
}

const DatePickerComponent: FC<DatePickerComponentProps> = ({
	formValues,
	onChangeField,
}) => {
	const { t } = useTranslation();

	return <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
		<DatePicker
			disableFuture
			label={t("edit_tabs.birthday")}
			value={dayjs(formValues.birthday)}
			onChange={(newValue: Dayjs | null) => {
				onChangeField("birthday", formattedValue(newValue));
			}}
			slotProps={{
				textField: {
					fullWidth: true,
					inputProps: {
						placeholder: t("edit_tabs.birthday_date")
					}
				},
			}}
		/>
	</LocalizationProvider>
};

export default DatePickerComponent;
