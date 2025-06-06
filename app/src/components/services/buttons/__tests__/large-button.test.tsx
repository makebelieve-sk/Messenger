import { render, screen } from "@testing-library/react";

import LargeButtonComponent from "@components/services/buttons/large-button";

describe("LargeButtonComponent", () => {
	test("renders with children", () => {
		render(<LargeButtonComponent>Test Button</LargeButtonComponent>);
		const button = screen.getByText("Test Button");
		expect(button).toBeInTheDocument();
	});

	test("applies large size prop", () => {
		render(<LargeButtonComponent>Test Button</LargeButtonComponent>);
		const button = screen.getByText("Test Button");
		expect(button).toHaveClass("MuiButton-sizeLarge");
	});

	test("passes through other props correctly", () => {
		render(
			<LargeButtonComponent 
				variant="contained" 
				color="primary"
				disabled
				className="custom-class"
				fullWidth
			>
                Test Button
			</LargeButtonComponent>,
		);
		const button = screen.getByText("Test Button");
		expect(button).toHaveClass("MuiButton-contained");
		expect(button).toHaveClass("MuiButton-colorPrimary");
		expect(button).toHaveClass("custom-class");
		expect(button).toHaveClass("MuiButton-fullWidth");
		expect(button).toBeDisabled();
	});

	test("handles click events", () => {
		const handleClick = jest.fn();
		render(
			<LargeButtonComponent onClick={handleClick}>
                Test Button
			</LargeButtonComponent>,
		);
		const button = screen.getByText("Test Button");
		button.click();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	test("matches snapshot", () => {
		const { asFragment } = render(
			<LargeButtonComponent variant="contained" color="primary" fullWidth>
                Test Button
			</LargeButtonComponent>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
