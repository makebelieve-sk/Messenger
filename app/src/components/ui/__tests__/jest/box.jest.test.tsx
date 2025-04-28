import { render, screen } from "@testing-library/react";

import BoxComponent from "@components/ui/box";

describe("BoxComponent", () => {
	test("BoxComponent with children", () => {
		render(<BoxComponent>Test</BoxComponent>);
		const boxElement = screen.getByText("Test");
		expect(boxElement).toBeInTheDocument();
	});

	test("BoxComponent with className", () => {
		render(<BoxComponent className="test-class">Test</BoxComponent>);
		const boxElement = screen.getByText("Test");
		expect(boxElement).toHaveClass("test-class");
	});

	test("BoxComponent with component prop", () => {
		render(<BoxComponent component="div">Test</BoxComponent>);
		const boxElement = screen.getByText("Test");
		expect(boxElement.tagName).toBe("DIV");
	});

	test("BoxComponent with noValidate prop", () => {
		render(<BoxComponent component="form" noValidate>Test</BoxComponent>);
		const boxElement = screen.getByText("Test").closest("form");
		expect(boxElement).toHaveAttribute("noValidate");
	});

	test("BoxComponent with onSubmit prop", () => {
		const handleSubmit = jest.fn();
		render(<BoxComponent component="form" onSubmit={handleSubmit}>
			Test
			<button type="submit">Submit</button>
		</BoxComponent>);
		const button = screen.getByText("Submit");
		// boxElement.dispatchEvent(new Event("submit"));
		button.click();
		expect(handleSubmit).toHaveBeenCalledTimes(1);
	});

	test("matches snapshot", () => {
		const { asFragment } = render(<BoxComponent>Test</BoxComponent>);

		// Снимаем снапшот компонента
		expect(asFragment()).toMatchSnapshot();
	});
});