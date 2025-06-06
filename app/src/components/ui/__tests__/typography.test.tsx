import { render, screen } from "@testing-library/react";

import TypographyComponent from "@components/ui/typography";

describe("Typography", () => {
	test("Typography with children", () => {
		render(<TypographyComponent>Test</TypographyComponent>);
		const typographyElement = screen.getByText("Test");
		expect(typographyElement).toBeInTheDocument();
	});

	test("matches snapshot", () => {
		const { asFragment } = render(<TypographyComponent>Test</TypographyComponent>);

		expect(asFragment()).toMatchSnapshot();
	});
});