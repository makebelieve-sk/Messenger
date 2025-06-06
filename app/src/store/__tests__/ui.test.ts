import useUIStore from "../ui";

jest.mock("@service/Logger", () => ({
	init: () => ({
		error: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
		debug: jest.fn(),
	}),
}));

describe("useUIStore", () => {
	test("default state", () => {
		const state = useUIStore.getState();
		expect(state.error).toBeNull();
		expect(state.snackbarError).toBeNull();
		expect(state.confirmModal).toBeNull();
		expect(state.settingsModal).toBe(false);
		expect(state.saveSettingsModal).toBe(false);
	});

	test("setError updates error", () => {
		const error = "Test error";
		useUIStore.getState().setError(error);
		expect(useUIStore.getState().error).toBe(error);
	});

	test("setSnackbarError updates snackbarError", () => {
		const snackbarError = "Test error";
		useUIStore.getState().setSnackbarError(snackbarError);
		expect(useUIStore.getState().snackbarError).toBe(snackbarError);
	});

	test("setConfirmModal updates confirmModal", () => {
		const confirmModal = {
			text: "Test confirmation",
			btnActionTitle: "Confirm",
			cb: jest.fn(),
		};
		useUIStore.getState().setConfirmModal(confirmModal);
		expect(useUIStore.getState().confirmModal).toEqual(confirmModal);
	});

	test("setSettingsModal updates settingsModal", () => {
		useUIStore.getState().setSettingsModal(true);
		expect(useUIStore.getState().settingsModal).toBe(true);
	});

	test("reset restores default state", () => {
		useUIStore.getState().setSnackbarError("Test error");
		useUIStore.getState().setConfirmModal({ text: "Test", btnActionTitle: "Test", cb: jest.fn() });
		useUIStore.getState().setSettingsModal(true);
		useUIStore.getState().setSaveSettingsModal(true);

		useUIStore.getState().reset();

		expect(useUIStore.getState().snackbarError).toBeNull();
		expect(useUIStore.getState().confirmModal).toBeNull();
		expect(useUIStore.getState().settingsModal).toBe(false);
		expect(useUIStore.getState().saveSettingsModal).toBe(false);
	});
});
