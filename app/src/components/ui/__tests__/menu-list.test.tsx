import { render, screen } from "@testing-library/react";

import MenuListComponent from "@components/ui/menu-list";

describe("MenuListComponent", () => {
	const mockProps = {
		children: <div>Test Child</div>,
		className: "custom-class",
	};

	it("should render with children", () => {
		render(<MenuListComponent {...mockProps} />);
        
		const menuList = screen.getByRole("menu");
		expect(menuList).toBeInTheDocument();
		expect(menuList).toHaveTextContent("Test Child");
	});

	it("should apply default menu-list class", () => {
		render(<MenuListComponent {...mockProps} />);
        
		const menuList = screen.getByRole("menu");
		expect(menuList).toHaveClass("menu__list");
	});

	it("should apply custom className", () => {
		render(<MenuListComponent {...mockProps} />);
        
		const menuList = screen.getByRole("menu");
		expect(menuList).toHaveClass("custom-class");
	});

	it("should render without custom className", () => {
		render(<MenuListComponent children={mockProps.children} />);
        
		const menuList = screen.getByRole("menu");
		expect(menuList).toHaveClass("menu__list");
		expect(menuList).not.toHaveClass("custom-class");
	});

	it("should render with empty className", () => {
		render(<MenuListComponent {...mockProps} className="" />);
        
		const menuList = screen.getByRole("menu");
		expect(menuList).toHaveClass("menu__list");
		expect(menuList).not.toHaveClass("custom-class");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<MenuListComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
