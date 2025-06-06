import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import NotificationSettingsService from "@core/services/NotificationSettingsService";
import type { INotificationSettings } from "@custom-types/models.types";
import useUIStore from "../../../__mocks__/@store/ui";

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

describe("NotificationSettingsService", () => {
	let mockRequest: jest.Mocked<Request>;
	let mockSettings: INotificationSettings;
	let service: NotificationSettingsService;

	beforeEach(() => {
		mockRequest = {
			get: jest.fn(),
			downloadFile: jest.fn(),
			post: jest.fn(),
			put: jest.fn(),
		} as unknown as jest.Mocked<Request>;

		mockSettings = {
			userId: "123",
			soundEnabled: true,
			messageSound: true,
			friendRequestSound: false,
		};

		service = new NotificationSettingsService(mockRequest, mockSettings);
	});

	describe("getters", () => {
		it("should return correct soundEnabled value", () => {
			expect(service.soundEnabled).toBe(true);
		});

		it("should return correct messageSound value", () => {
			expect(service.messageSound).toBe(true);
		});

		it("should return correct friendRequestSound value", () => {
			expect(service.friendRequestSound).toBe(false);
		});

		it("should convert falsy values to boolean", () => {
			const serviceWithFalsyValues = new NotificationSettingsService(mockRequest, {
				...mockSettings,
				soundEnabled: false,
				messageSound: false,
				friendRequestSound: false,
			});

			expect(serviceWithFalsyValues.soundEnabled).toBe(false);
			expect(serviceWithFalsyValues.messageSound).toBe(false);
			expect(serviceWithFalsyValues.friendRequestSound).toBe(false);
		});
	});

	describe("changeSoundNotifications", () => {
		const newSettings: Omit<INotificationSettings, "userId"> = {
			soundEnabled: false,
			messageSound: false,
			friendRequestSound: true,
		};

		it("should call request.put with correct parameters", () => {
			service.changeSoundNotifications(newSettings);

			expect(mockRequest.put).toHaveBeenCalledWith({
				route: ApiRoutes.soundNotifications,
				data: { ...newSettings, userId: mockSettings.userId },
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			});
		});

		it("should update settings and close modals on success", () => {
			const setSaveSettingsModal = jest.fn();
			const setSettingsModal = jest.fn();
			const mockStore: UIStore = {
				error: null,
				snackbarError: null,
				confirmModal: null,
				settingsModal: false,
				saveSettingsModal: false,
				setSaveSettingsModal,
				setSettingsModal,
				setError: jest.fn(),
				setSnackbarError: jest.fn(),
				setConfirmModal: jest.fn(),
				reset: jest.fn(),
				getState: () => mockStore,
			};
			jest.spyOn(useUIStore, "getState").mockReturnValue(mockStore);

			service.changeSoundNotifications(newSettings);

			const successCb = mockRequest.put.mock.calls[0][0].successCb;
			if (successCb) {
				successCb(undefined);
			}

			expect(setSaveSettingsModal).toHaveBeenCalledWith(false);
			expect(setSettingsModal).toHaveBeenCalledWith(false);
		});

		it("should set loading state while request is in progress", () => {
			const setSaveSettingsModal = jest.fn();
			const setSettingsModal = jest.fn();
			const mockStore: UIStore = {
				error: null,
				snackbarError: null,
				confirmModal: null,
				settingsModal: false,
				saveSettingsModal: false,
				setSaveSettingsModal,
				setSettingsModal,
				setError: jest.fn(),
				setSnackbarError: jest.fn(),
				setConfirmModal: jest.fn(),
				reset: jest.fn(),
				getState: () => mockStore,
			};
			jest.spyOn(useUIStore, "getState").mockReturnValue(mockStore);

			service.changeSoundNotifications(newSettings);

			const setLoading = mockRequest.put.mock.calls[0][0].setLoading;
			if (setLoading) {
				setLoading(true);
			}

			expect(setSaveSettingsModal).toHaveBeenCalledWith(true);
		});
	});
});
