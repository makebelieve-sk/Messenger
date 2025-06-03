import { render, screen } from "@testing-library/react";

import UpperButton from "@components/ui/upper-button";

describe("UpperButton", () => {
	test("renders with KeyboardArrowUpIcon", () => {
		render(<UpperButton />);
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
		expect(button.querySelector("svg")).toBeInTheDocument();
	});

	test("applies upper-button class", () => {
		render(<UpperButton />);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("upper-button");
	});

	test("passes through other props correctly", () => {
		render(
			<UpperButton 
				variant="contained" 
				color="primary"
				disabled
			/>,
		);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("MuiButton-contained");
		expect(button).toHaveClass("MuiButton-colorPrimary");
		expect(button).toBeDisabled();
	});

	test("handles click events", () => {
		const handleClick = jest.fn();
		render(<UpperButton onClick={handleClick} />);
		const button = screen.getByRole("button");
		button.click();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	test("matches snapshot", () => {
		const { asFragment } = render(
			<UpperButton variant="contained" color="primary" />,
		);
		expect(asFragment()).toMatchSnapshot();
	});
}); 