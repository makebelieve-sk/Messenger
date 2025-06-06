import { fireEvent, render, screen } from "@testing-library/react";

import ModalWithConfirm from "@components/services/modals/confirm";
import mockUIStore from "../../../../__mocks__/@store/ui";

describe("ModalWithConfirm", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should not render when confirmModal is null", () => {
		const store = mockUIStore.getState();
		store.confirmModal = null;

		const { container } = render(<ModalWithConfirm />);
		expect(container).toBeEmptyDOMElement();
		expect(container).toMatchSnapshot();
	});

	it("should render with text", () => {
		const store = mockUIStore.getState();
		store.confirmModal = {
			text: "Test confirmation",
			btnActionTitle: "Confirm",
			cb: jest.fn(),
		};

		const { container } = render(<ModalWithConfirm />);
        
		expect(screen.getByText("Test confirmation")).toBeInTheDocument();
		expect(screen.getByText("Confirm")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should render with custom button text", () => {
		const store = mockUIStore.getState();
		store.confirmModal = {
			text: "Test text",
			btnActionTitle: "Test",
			cb: jest.fn(),
		};

		const { container } = render(<ModalWithConfirm />);
        
		expect(screen.getByText("Test text")).toBeInTheDocument();
		expect(screen.getByText("Test")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should call callback and close modal when confirm button is clicked", async () => {
		const store = mockUIStore.getState();
		const mockCallback = jest.fn();
		store.confirmModal = {
			text: "Test confirmation",
			btnActionTitle: "Confirm",
			cb: mockCallback,
		};

		const { container } = render(<ModalWithConfirm />);
        
		const confirmButton = screen.getByText("Confirm");
		await fireEvent.click(confirmButton);

		await new Promise(resolve => setTimeout(resolve, 0));

		expect(mockCallback).toHaveBeenCalled();
		expect(store.setConfirmModal).toHaveBeenCalledWith(null);
		expect(container).toMatchSnapshot();
	});

	it("should close modal when cancel button is clicked", () => {
		const store = mockUIStore.getState();
		store.confirmModal = {
			text: "Test confirmation",
			btnActionTitle: "Test",
			cb: jest.fn(),
		};

		const { container } = render(<ModalWithConfirm />);
        
		const cancelButton = screen.getByText("Cancel");
		fireEvent.click(cancelButton);

		expect(store.setConfirmModal).toHaveBeenCalledWith(null);
		expect(container).toMatchSnapshot();
	});

	it("should not call callback if it is not provided", async () => {
		const store = mockUIStore.getState();
		store.confirmModal = {
			text: "Test confirmation",
			btnActionTitle: "Confirm",
			cb: () => {},
		};

		const { container } = render(<ModalWithConfirm />);
        
		const confirmButton = screen.getByText("Confirm");
		await fireEvent.click(confirmButton);

		await new Promise(resolve => setTimeout(resolve, 0));

		expect(store.setConfirmModal).toHaveBeenCalledWith(null);
		expect(container).toMatchSnapshot();
	});
});
