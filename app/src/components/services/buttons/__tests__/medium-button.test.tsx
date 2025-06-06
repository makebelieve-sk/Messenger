import { render, screen } from "@testing-library/react";

import MediumButtonComponent from "@components/services/buttons/medium-button";

describe("MediumButtonComponent", () => {
	test("renders with children", () => {
		render(<MediumButtonComponent>Test Button</MediumButtonComponent>);
		const button = screen.getByText("Test Button");
		expect(button).toBeInTheDocument();
	});

	test("applies medium size prop", () => {
		render(<MediumButtonComponent>Test Button</MediumButtonComponent>);
		const button = screen.getByText("Test Button");
		expect(button).toHaveClass("MuiButton-sizeMedium");
	});

	test("passes through other props correctly", () => {
		render(
			<MediumButtonComponent 
				variant="outlined" 
				color="secondary"
				disabled
				className="custom-class"
			>
                Test Button
			</MediumButtonComponent>,
		);
		const button = screen.getByText("Test Button");
		expect(button).toHaveClass("MuiButton-outlined");
		expect(button).toHaveClass("MuiButton-colorSecondary");
		expect(button).toHaveClass("custom-class");
		expect(button).toBeDisabled();
	});

	test("handles click events", () => {
		const handleClick = jest.fn();
		render(
			<MediumButtonComponent onClick={handleClick}>
                Test Button
			</MediumButtonComponent>,
		);
		const button = screen.getByText("Test Button");
		button.click();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	test("matches snapshot", () => {
		const { asFragment } = render(
			<MediumButtonComponent variant="outlined" color="secondary">
                Test Button
			</MediumButtonComponent>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
