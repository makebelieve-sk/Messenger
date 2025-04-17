import { create } from "zustand";

import { type IConfirmModalData } from "@components/services/modals/confirm";
import Logger from "@service/Logger";

interface IUIState {
    error: string | null;
    snackbarError: string | null;
    confirmModal: IConfirmModalData | null;
};

interface IUIActions {
    setError: (error: string | null) => void;
    setSnackbarError: (snackbarError: string | null) => void;
    setConfirmModal: (confirmModal: IConfirmModalData | null) => void;
    reset: () => void;
};

const logger = Logger.init("store.UI");

// Состояние по умолчанию
const resetState = {
	error: null,
	snackbarError: null,
	confirmModal: null,
};

// Состояние основных UI частей приложения
const useUIStore = create<IUIState & IUIActions>(set => ({
	...resetState,

	setError: error => {
		// Обязаны логировать ошибку, если она есть
		if (error) logger.error(error);
		return set({ error });
	},
	setSnackbarError: snackbarError => set({ snackbarError }),
	setConfirmModal: confirmModal => set({ confirmModal }),
	reset: () => set({ ...resetState }),
}));

export default useUIStore;