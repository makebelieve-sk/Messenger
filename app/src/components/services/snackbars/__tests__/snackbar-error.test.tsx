import { render, screen } from "@testing-library/react";

import SnackbarError from "@components/services/snackbars/error";
import mockUIStore from "../../../../__mocks__/@store/ui";

describe("SnackbarError", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should not render when error is null", () => {
		const store = mockUIStore.getState();
		store.snackbarError = null;

		const { container } = render(<SnackbarError />);
		expect(container).toBeEmptyDOMElement();
	});

	it("should render with error message", () => {
		const store = mockUIStore.getState();
		store.snackbarError = "Test error message";

		render(<SnackbarError />);
        
		const alert = screen.getByRole("alert");
		expect(alert).toHaveTextContent("Test error message");
	});
});
