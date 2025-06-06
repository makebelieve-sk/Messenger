import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ModalWithSettings from "@components/services/modals/settings";
import { mockNotificationSettingsService } from "../../../../__mocks__/@hooks/useProfile";
import mockProfileStore from "../../../../__mocks__/@store/profile";
import mockUIStore from "../../../../__mocks__/@store/ui";

describe("ModalWithSettings", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		const store = mockUIStore.getState();
		store.settingsModal = true;
		store.saveSettingsModal = false;
		store.setSettingsModal = jest.fn();
		store.setConfirmModal = jest.fn();

		const profileStore = mockProfileStore.getState();
		profileStore.isDeleteAccountLoading = false;
	});

	describe("Form initialization", () => {
		it("should initialize form with settings service values when modal is open", () => {
			render(<ModalWithSettings />);

			const soundSwitch = screen.getByLabelText("All sound notifications");
			const messageSwitch = screen.getByLabelText("Sound notifications when receiving a message");
			const friendRequestSwitch = screen.getByLabelText("Sound notifications when receiving a friend's request");

			expect(soundSwitch).not.toBeChecked();
			expect(messageSwitch).not.toBeChecked();
			expect(friendRequestSwitch).not.toBeChecked();
		});

		it("should not initialize form when modal is closed", () => {
			const store = mockUIStore.getState();
			store.settingsModal = false;

			const { container } = render(<ModalWithSettings />);
			expect(container).toBeEmptyDOMElement();
		});

		it("should not initialize form when settings service is not available", () => {
			const { container } = render(<ModalWithSettings />);
			expect(container).toBeEmptyDOMElement();
		});

		it("should update form when settings service values change", async () => {
			const { rerender } = render(<ModalWithSettings />);

			mockNotificationSettingsService.soundEnabled = false;
			mockNotificationSettingsService.messageSound = false;
			mockNotificationSettingsService.friendRequestSound = false;

			rerender(<ModalWithSettings />);

			const soundSwitch = screen.getByLabelText("All sound notifications");
			const messageSwitch = screen.getByLabelText("Sound notifications when receiving a message");
			const friendRequestSwitch = screen.getByLabelText("Sound notifications when receiving a friend's request");

			expect(soundSwitch).not.toBeChecked();
			expect(messageSwitch).not.toBeChecked();
			expect(friendRequestSwitch).not.toBeChecked();
		});
	});

	it("should match snapshot when modal is open", () => {
		const { container } = render(<ModalWithSettings />);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot when modal is closed", () => {
		const store = mockUIStore.getState();
		store.settingsModal = false;
		store.saveSettingsModal = false;
		store.setSettingsModal = jest.fn();
		store.setConfirmModal = jest.fn();

		const { container } = render(<ModalWithSettings />);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot when saving", () => {
		const store = mockUIStore.getState();
		store.settingsModal = true;
		store.saveSettingsModal = true;
		store.setSettingsModal = jest.fn();
		store.setConfirmModal = jest.fn();

		const { container } = render(<ModalWithSettings />);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot when deleting account", () => {
		const profileStore = mockProfileStore.getState();
		profileStore.isDeleteAccountLoading = true;

		const { container } = render(<ModalWithSettings />);
		expect(container).toMatchSnapshot();
	});

	it("should not render when modal is closed", () => {
		const store = mockUIStore.getState();
		store.settingsModal = false;
		store.saveSettingsModal = false;
		store.setSettingsModal = jest.fn();
		store.setConfirmModal = jest.fn();

		const { container } = render(<ModalWithSettings />);
		expect(container).toBeEmptyDOMElement();
	});

	it("should render with initial settings", () => {
		render(<ModalWithSettings />);

		expect(screen.getByText("App settings")).toBeInTheDocument();
		expect(screen.getByText("Deleting your profile.")).toBeInTheDocument();
		expect(screen.getByText("Save")).toBeInTheDocument();
		expect(screen.getByText("Cancel")).toBeInTheDocument();
	});

	it("should handle form changes", async () => {
		render(<ModalWithSettings />);

		const soundSwitch = screen.getByLabelText("All sound notifications");
		fireEvent.click(soundSwitch);

		const saveButton = screen.getByText("Save");
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(mockNotificationSettingsService.changeSoundNotifications).toHaveBeenCalledWith({
				soundEnabled: true,
				messageSound: false,
				friendRequestSound: false,
			});
		});
	});

	it("should handle save button click", async () => {
		render(<ModalWithSettings />);

		const saveButton = screen.getByText("Save");
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(mockNotificationSettingsService.changeSoundNotifications).toHaveBeenCalledWith({
				soundEnabled: false,
				messageSound: false,
				friendRequestSound: false,
			});
		});
	});

	it("should handle delete account button click", () => {
		render(<ModalWithSettings />);

		const deleteButton = screen.getByText("Delete profile");
		fireEvent.click(deleteButton);

		expect(mockUIStore.getState().setConfirmModal).toHaveBeenCalledWith({
			text: "Do you really want to delete your account?",
			btnActionTitle: "Delete",
			cb: expect.any(Function),
		});
	});

	it("should handle cancel button click", () => {
		render(<ModalWithSettings />);

		const cancelButton = screen.getByText("Cancel");
		fireEvent.click(cancelButton);

		expect(mockUIStore.getState().setSettingsModal).toHaveBeenCalledWith(false);
	});

	it("should show loading state when saving", () => {
		const store = mockUIStore.getState();
		store.settingsModal = true;
		store.saveSettingsModal = true;
		store.setSettingsModal = jest.fn();
		store.setConfirmModal = jest.fn();

		render(<ModalWithSettings />);

		const saveButton = screen.getByText("Save");
		expect(saveButton).toHaveClass("Mui-disabled");
	});

	it("should show loading state when deleting account", () => {
		const profileStore = mockProfileStore.getState();
		profileStore.isDeleteAccountLoading = true;

		render(<ModalWithSettings />);

		const deleteButton = screen.getByText("Delete profile");
		expect(deleteButton).toHaveClass("Mui-disabled");
	});
});
