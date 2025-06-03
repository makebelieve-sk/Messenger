import { render, screen } from "@testing-library/react";

import SuspenseSpinner from "@components/ui/suspense-spinner";

describe("SuspenseSpinner", () => {
	it("should render with custom className", () => {
		render(<SuspenseSpinner className="custom-class" />);
        
		const container = screen.getByTestId("spinner").parentElement;
		expect(container).toHaveClass("custom-class");
	});

	it("should render spinner component", () => {
		render(<SuspenseSpinner className="custom-class" />);
        
		const spinner = screen.getByTestId("spinner");
		expect(spinner).toBeInTheDocument();
		expect(spinner).toHaveClass("spinner");
	});

	it("should render with empty className", () => {
		render(<SuspenseSpinner className="" />);
        
		const spinner = screen.getByTestId("spinner");
		expect(spinner).toHaveClass("spinner");
	});

	it("should render with default spinner styles", () => {
		render(<SuspenseSpinner className="spinner" />);
        
		const spinner = screen.getByTestId("spinner");
		expect(spinner).toHaveClass("spinner");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<SuspenseSpinner className="custom-class" />);
		expect(asFragment()).toMatchSnapshot();
	});
});
