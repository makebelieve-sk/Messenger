import { render, screen } from "@testing-library/react";

import InputImage from "@components/ui/input-image";

describe("InputImage", () => {
	it("should render InputImage", () => {
		render(<InputImage id="test" text="test" loading={false} onChange={() => { }} />);
		expect(screen.getByText("test")).toBeInTheDocument();
	});

	test("matches snapshot", () => {
		const { asFragment } = render(<InputImage id="test" text="test" loading={false} onChange={() => { }}></InputImage>);

		expect(asFragment()).toMatchSnapshot();
	});
});