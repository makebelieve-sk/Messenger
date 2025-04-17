import dayjs, { Dayjs } from "dayjs";
import { JSX, lazy, memo, Suspense } from "react";

import SpinnerComponent from "@components/ui/spinner";
import { IFormValues } from "@pages/Edit";
import i18next from "@service/i18n";
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
	value: dayjs.Dayjs | null;
	placeholder: string;
	onChange: (value: Dayjs | null) => void;
};

// Динамически подгружаем компонент и его локализацию (так как пакет имеет большой вес)
const LazyLoadedProvider = lazy(async (): Promise<LazyLoadedProviderType> => {
	// Динамически загружаем пакеты @mui/x-date-pickers и @mui/x-date-pickers/AdapterDayjs
	const [ { DatePicker, LocalizationProvider }, AdapterDayjs ] = await Promise.all([ 
		import("@mui/x-date-pickers"), 
		import("@mui/x-date-pickers/AdapterDayjs"), 
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
							inputProps: { placeholder },
						},
					}}
				/>
			</LocalizationProvider>
		),
	};
});

// Компонент, отрисовывает выбор даты рождения
export default memo(function DatePickerComponent({ formValues, onChangeField }: IDatePicker) {
	const fallbackComponent = <div className="date-picker__loading">
		<SpinnerComponent />
	</div>;

	const onChange = (newValue: Dayjs | null) => {
		onChangeField("birthday", formattedValue(newValue));
	};

	return <Suspense fallback={fallbackComponent}>
		<LazyLoadedProvider
			label={i18next.t("edit_tabs.birthday")}
			value={formValues.birthday ? dayjs(formValues.birthday) : null}
			placeholder={i18next.t("edit_tabs.birthday_date")}
			onChange={onChange}
		/>
	</Suspense>;
});
