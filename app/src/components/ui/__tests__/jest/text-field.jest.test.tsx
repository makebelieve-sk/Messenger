import { render, screen } from "@testing-library/react";

import TextFieldComponent from "@components/ui/text-field";

describe("Text-field", () => {
	test("Text-field shows correct", () => {
		render(<TextFieldComponent></TextFieldComponent>);
		const textFieldElement = screen.getByTestId("text-field");
		expect(textFieldElement).toBeInTheDocument();
	});
	test("Text-field has className", () => {
		render(<TextFieldComponent></TextFieldComponent>);
		const textFieldElement = screen.getByTestId("text-field");
		expect(textFieldElement).toHaveClass("MuiTextField-root");
	});

	test("matches snapshot", () => {
		const { asFragment } = render(<TextFieldComponent></TextFieldComponent>);

		// Снимаем снапшот компонента
		expect(asFragment()).toMatchSnapshot();
	});
});