import { render, screen } from "@testing-library/react";

import MenuItemComponent from "@components/ui/menu-item";

describe("Menu-item", () => {
	test("Menu-item shows correct", () => {
		render(<MenuItemComponent>Test</MenuItemComponent>);
		const menuItemElement = screen.getByText("Test");
		expect(menuItemElement).toBeInTheDocument();
	});
	test("Menu-item has className", () => {
		render(<MenuItemComponent>Test</MenuItemComponent>);
		const menuItemElement = screen.getByText("Test");
		expect(menuItemElement).toHaveClass("MuiMenuItem-root");
	});
	test("matches snapshot", () => {
		const { asFragment } = render(<MenuItemComponent>Test</MenuItemComponent>);

		// Снимаем снапшот компонента
		expect(asFragment()).toMatchSnapshot();
	});
});