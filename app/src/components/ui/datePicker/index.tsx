import SpinnerComponent from "../spinner";
import { lazy, Suspense, JSX } from "react";
import dayjs, { Dayjs } from "dayjs";

// Типизация возвращаемых значений для динамической загрузки
type LazyLoadedProviderType = {
    default: ({ label, value, placeholder, onChange }: ILazyDatePicker) => JSX.Element;
};

interface ILazyDatePicker {
    label: string;
    value: dayjs.Dayjs;
    placeholder: string;
    onChange: (value: Dayjs | null) => void;
};

// Динамически подгружаем компонент и его локализацию (так как пакет имеет большой вес)
const LazyLoadedProvider = lazy(async (): Promise<LazyLoadedProviderType> => {

    // Динамически загружаем пакеты @mui/x-date-pickers и @mui/x-date-pickers/AdapterDayjs
    const [{ DatePicker, LocalizationProvider }, AdapterDayjs] = await Promise.all([
        import("@mui/x-date-pickers"),
        import("@mui/x-date-pickers/AdapterDayjs")
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
                            inputProps: { placeholder }
                        }
                    }}
                />
            </LocalizationProvider>
        )
    };
});

export default function LazyDatePicker(props: ILazyDatePicker) {
    return <Suspense fallback={<div className="date-picker__loading"><SpinnerComponent /></div>}>
        <LazyLoadedProvider {...props} />
    </Suspense>
}