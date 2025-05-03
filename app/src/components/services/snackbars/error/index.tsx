import Alert from "@mui/material/Alert";

import SnackbarComponent from "@components/ui/snackbar";
import useUIStore from "@store/ui";

const snackBarAnchor = { vertical: "bottom", horizontal: "left" } as const;

/**
 * Всплывающая подсказка с системной ошибкой. 
 * Эта ошибка не критична, поэтому не блокируем действия пользователя - он может ее закрыть
 * и дальше находится на сайте.
 * Показываем следующие ошибки:
 * 1) системную ошибку из socket.io соединения
 * 2) максимальный размер/количество файлов (обработка статуса 413, см. CatchErrors)
 * 3) большое количество запросов к ендпоинту (обработка статуса 429, см. CatchErrors)
 */
export default function SnackbarError() {
	const snackbarError = useUIStore(state => state.snackbarError);

	// Закрытие окна с системной ошибкой
	const onCloseSnack = () => {
		useUIStore.getState().setSnackbarError(null);
	};

	if (!snackbarError) return null;

	/**
	 * Исключение:
	 * Внутри себя Snackbar компонент от MUI прокидывает дочернему элементу реф для упралвения анимацией/transition,
	 * поэтому необходимо использовать обычный Alert от MUI, а не кастомный. Либо прокинуть кастомному (нашему) компоненту
	 * реф через forwardRef, но с точки зрения архитектуры это бесполезно, так как используется такой реф только здесь - а это
	 * и так отдельный компонент.
	 */
	return <SnackbarComponent anchor={snackBarAnchor} open handleClose={onCloseSnack}>
		<Alert severity="error">
			{snackbarError}
		</Alert>
	</SnackbarComponent>;
};