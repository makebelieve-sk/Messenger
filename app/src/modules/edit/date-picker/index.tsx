import { memo, lazy, Suspense, JSX } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

import SpinnerComponent from "@components/ui/spinner";
import { IFormValues } from "@pages/Edit";
import { formattedValue } from "@utils/date";

import "./date-picker.scss";

interface IDatePicker {
	formValues: IFormValues;
	onChangeField: (field: string, value: string | null) => void;
};

// Типизация возвращаемых значений для динамической загрузки
type LazyLoadedProviderType = {
	default: ({ label, value, placeholder, onChange }: ILazyLoad) => JSX.Element;
};

interface ILazyLoad {
	label: string;
	value: dayjs.Dayjs;
	placeholder: string;
	onChange: (value: Dayjs | null) => void;
};

// Динамически подгружаем компонент и его локализацию (так как пакет имеет большой вес)
const LazyLoadedProvider = lazy(async (): Promise<LazyLoadedProviderType> => {
	for (let i = 0; i < 1000000000; i++) {

	}
	// Динамически загружаем пакеты @mui/x-date-pickers и @mui/x-date-pickers/AdapterDayjs
	const [{ DatePicker, LocalizationProvider }, AdapterDayjs] = await Promise.all([
		import("@mui/x-date-pickers"),
		import("@mui/x-date-pickers/AdapterDayjs")
	]);

	// Динамически загружаем интернационализацию
	await import("dayjs/locale/ru");

	// Обязательно после загрузки всех пакетов для date-picker возвращаем компонент
	return {
		default: ({ label, value, placeholder, onChange }: ILazyLoad) => (
		  <LocalizationProvider dateAdapter={AdapterDayjs.AdapterDayjs} adapterLocale="ru">
			<DatePicker
				disableFuture
				label={label}
				value={value}
				onChange={onChange}
				slotProps={{
					textField: {
						fullWidth: true,
						inputProps: { placeholder }
					}
				}}
			/>
		  </LocalizationProvider>
		)
	};
});

export default memo(function DatePickerComponent({ formValues, onChangeField }: IDatePicker) {
	const { t } = useTranslation();

	return <Suspense fallback={<div className="date-picker__loading"><SpinnerComponent /></div>}>
		<LazyLoadedProvider
			label={t("edit_tabs.birthday")}
			value={dayjs(formValues.birthday)}
			placeholder={t("edit_tabs.birthday_date")}
			onChange={(newValue: Dayjs | null) => {
				onChangeField("birthday", formattedValue(newValue));
			}}
		/>
	</Suspense>
});