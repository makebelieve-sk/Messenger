import { render, screen } from "@testing-library/react";

import SmallButtonComponent from "@components/services/buttons/small-button";

describe("SmallButtonComponent", () => {
	test("renders with children", () => {
		render(<SmallButtonComponent>Test Button</SmallButtonComponent>);
		const button = screen.getByText("Test Button");
		expect(button).toBeInTheDocument();
	});

	test("applies small size prop", () => {
		render(<SmallButtonComponent>Test Button</SmallButtonComponent>);
		const button = screen.getByText("Test Button");
		expect(button).toHaveClass("MuiButton-sizeSmall");
	});

	test("passes through other props correctly", () => {
		render(
			<SmallButtonComponent 
				variant="contained" 
				color="primary"
				disabled
				className="custom-class"
			>
                Test Button
			</SmallButtonComponent>,
		);
		const button = screen.getByText("Test Button");
		expect(button).toHaveClass("MuiButton-contained");
		expect(button).toHaveClass("MuiButton-colorPrimary");
		expect(button).toHaveClass("custom-class");
		expect(button).toBeDisabled();
	});

	test("handles click events", () => {
		const handleClick = jest.fn();
		render(
			<SmallButtonComponent onClick={handleClick}>
                Test Button
			</SmallButtonComponent>,
		);
		const button = screen.getByText("Test Button");
		button.click();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	test("matches snapshot", () => {
		const { asFragment } = render(
			<SmallButtonComponent variant="contained" color="primary">
                Test Button
			</SmallButtonComponent>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
