import { render } from "@testing-library/react";

import DoneIcon from "../done";

describe("DoneIcon", () => {
	it("renders correctly", () => {
		const { container } = render(<DoneIcon />);
		expect(container).toMatchSnapshot();
	});

	it("applies custom className", () => {
		const { container } = render(<DoneIcon className="custom-class" />);
		const svg = container.querySelector("svg");
		expect(svg).toHaveClass("custom-class");
	});

	it("has correct SVG attributes", () => {
		const { container } = render(<DoneIcon />);
		const svg = container.querySelector("svg");
    
		expect(svg).toHaveAttribute("xmlns", "http://www.w3.org/2000/svg");
		expect(svg).toHaveAttribute("height", "24");
		expect(svg).toHaveAttribute("width", "24");
		expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
	});
});
