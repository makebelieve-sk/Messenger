import { type Dayjs } from "dayjs";
import { lazy, memo, type ReactNode, Suspense } from "react";

import SuspenseSpinner from "@components/ui/suspense-spinner";

// Типизация возвращаемых значений для динамической загрузки
interface LazyLoadedProviderType {
    default: ({ label, value, placeholder, onChange }: ILazyDatePicker) => ReactNode;
};

interface ILazyDatePicker {
    label: string;
    value: Dayjs;
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
		default: ({ label, value, placeholder, onChange }: ILazyDatePicker) => (
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

// Базовый компонент датапикеров. Лениво подгружаем компонент из большого пакета для увеличения скорости сборки
export default memo(function LazyDatePicker(props: ILazyDatePicker) {
	return <Suspense fallback={<SuspenseSpinner className="date-picker__loading" />}>
		<LazyLoadedProvider {...props} />
	</Suspense>;
});