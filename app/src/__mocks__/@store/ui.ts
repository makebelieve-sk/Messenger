import { type StoreApi } from "zustand";

interface UIStore {
  error: string | null;
  snackbarError: string | null;
  confirmModal: { text: string; btnActionTitle: string; cb: () => void } | null;
  settingsModal: boolean;
  saveSettingsModal: boolean;
  setError: (error: string | null) => void;
  setSnackbarError: (error: string | null) => void;
  setConfirmModal: (modal: { text: string; onConfirm: () => void } | null) => void;
  setSettingsModal: (isOpen: boolean) => void;
  setSaveSettingsModal: (isOpen: boolean) => void;
  reset: () => void;
  getState: () => UIStore;
}

const mockUIStore: UIStore = {
	error: null,
	snackbarError: null,
	confirmModal: null,
	settingsModal: false,
	saveSettingsModal: false,
	setError: jest.fn(),
	setSnackbarError: jest.fn(),
	setConfirmModal: jest.fn(),
	setSettingsModal: jest.fn(),
	setSaveSettingsModal: jest.fn(),
	reset: jest.fn(),
	getState: () => mockUIStore,
};

const useUIStore = jest.fn((selector) => selector(mockUIStore)) as unknown as StoreApi<UIStore>;
useUIStore.getState = () => mockUIStore;

export default useUIStore;