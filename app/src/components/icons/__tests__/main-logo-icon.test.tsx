import { render, screen } from "@testing-library/react";

import MainLogoIconComponent from "@components/icons/main-logo";

describe("MainLogoIcon", () => {
	it("renders with default props", () => {
		render(<MainLogoIconComponent />);
		const svg = screen.getByTestId("main-logo");
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveAttribute("width", "136");
		expect(svg).toHaveAttribute("height", "24");
	});

	it("renders with correct SVG structure", () => {
		render(<MainLogoIconComponent />);
		const svg = screen.getByTestId("main-logo");
		expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
		expect(svg).toHaveAttribute("fill", "none");
	});

	it("matches snapshot", () => {
		const { container } = render(<MainLogoIconComponent />);
		expect(container).toMatchSnapshot();
	});
}); 