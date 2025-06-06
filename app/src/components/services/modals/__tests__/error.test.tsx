import { act, fireEvent, render, screen } from "@testing-library/react";

import ModalWithError from "@components/services/modals/error";
import mockUseMainClient from "../../../../__mocks__/@hooks/useMainClient";
import mockUIStore from "../../../../__mocks__/@store/ui";
import { mockNavigate } from "../../../../__mocks__/react-router-dom";

Object.assign(navigator, {
	clipboard: {
		writeText: jest.fn(),
	},
});

describe("ModalWithError", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should not render when error is null", () => {
		const store = mockUIStore.getState();
		store.error = null;

		const { container } = render(<ModalWithError />);
		expect(container).toBeEmptyDOMElement();
	});

	it("should render with error message", () => {
		const store = mockUIStore.getState();
		store.error = "Test error message";

		const { container } = render(<ModalWithError />);
        
		expect(screen.getByText("Oops! An error occurred in the server operation.")).toBeInTheDocument();
		expect(screen.getByText("Test error message")).toBeInTheDocument();
		expect(screen.getByText("Download the log file")).toBeInTheDocument();
		expect(screen.getByText("Reset page")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should copy error message to clipboard when clicked", async () => {
		const store = mockUIStore.getState();
		store.error = "Test error message";
		(navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);

		render(<ModalWithError />);
        
		const errorText = screen.getByText("Test error message");
		await act(async () => {
			await fireEvent.click(errorText);
		});

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Test error message");
		await screen.findByText("The text has been successfully copied to the clipboard!");
	});

	it("should show error when clipboard write fails", async () => {
		const store = mockUIStore.getState();
		store.error = "Test error message";
		const clipboardError = new Error("Clipboard error");
		(navigator.clipboard.writeText as jest.Mock).mockRejectedValue(clipboardError);

		render(<ModalWithError />);
        
		const errorText = screen.getByText("Test error message");
		await act(async () => {
			await fireEvent.click(errorText);
		});

		expect(store.setError).toHaveBeenCalledWith("Error when copying text to clipboard: Error: Clipboard error");
	});

	it("should download log file when download button is clicked", () => {
		const store = mockUIStore.getState();
		store.error = "Test error message";

		render(<ModalWithError />);
        
		const downloadButton = screen.getByText("Download the log file");
		fireEvent.click(downloadButton);

		expect(mockUseMainClient().downloadLogFile).toHaveBeenCalled();
	});

	it("should reload page when reset button is clicked", () => {
		const store = mockUIStore.getState();
		store.error = "Test error message";

		render(<ModalWithError />);
        
		const resetButton = screen.getByText("Reset page");
		fireEvent.click(resetButton);

		expect(mockNavigate).toHaveBeenCalledWith(0);
	});

	it("should close modal when close button is clicked", () => {
		const store = mockUIStore.getState();
		store.error = "Test error message";

		render(<ModalWithError />);
        
		const closeButton = screen.getByTestId("close-icon");
		fireEvent.click(closeButton);

		expect(store.setError).toHaveBeenCalledWith(null);
	});

	it("should render with email in copy message", () => {
		const store = mockUIStore.getState();
		store.error = "Test error message";

		render(<ModalWithError />);
        
		expect(screen.getByText("Please copy the error text and email it to the developers: mocked@mail.com.")).toBeInTheDocument();
	});

	it("should handle empty support email", () => {
		const store = mockUIStore.getState();
		store.error = "Test error message";
		const originalEmail = process.env.REACT_APP_SUPPORT_EMAIL;
		process.env.REACT_APP_SUPPORT_EMAIL = "";

		render(<ModalWithError />);
        
		expect(screen.getByText("Please copy the error text and email it to the developers: mocked@mail.com.")).toBeInTheDocument();
        
		process.env.REACT_APP_SUPPORT_EMAIL = originalEmail;
	});
});
