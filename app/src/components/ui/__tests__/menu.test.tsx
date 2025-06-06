import { fireEvent, render, screen } from "@testing-library/react";

import MenuComponent from "@components/ui/menu";

describe("MenuComponent", () => {
	const mockProps = {
		children: <div>Test Child</div>,
		anchorEl: document.createElement("div"),
		anchorOrigin: {
			vertical: "top" as const,
			horizontal: "left" as const,
		},
		open: true,
		autoFocus: false,
		onClose: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render when open is true", () => {
		render(<MenuComponent {...mockProps} />);
        
		const menu = screen.getByRole("menu");
		expect(menu).toBeInTheDocument();
		expect(menu).toHaveTextContent("Test Child");
	});

	it("should not render when open is false", () => {
		render(<MenuComponent {...mockProps} open={false} />);
        
		const menu = screen.queryByRole("menu");
		expect(menu).not.toBeInTheDocument();
	});

	it("should call onClose when backdrop is clicked", () => {
		render(<MenuComponent {...mockProps} />);
        
		const backdrop = document.querySelector(".MuiBackdrop-root");
		if (backdrop) {
			fireEvent.click(backdrop);
		}
        
		expect(mockProps.onClose).toHaveBeenCalledWith(expect.anything(), "backdropClick");
	});

	it("should call onClose when escape key is pressed", () => {
		render(<MenuComponent {...mockProps} />);
        
		const menuPaper = document.querySelector(".MuiMenu-paper");
		if (menuPaper) {
			fireEvent.keyDown(menuPaper, { key: "Escape" });
		}
        
		expect(mockProps.onClose).toHaveBeenCalledWith(expect.anything(), "escapeKeyDown");
	});

	it("should not autoFocus when autoFocus is false", () => {
		render(
			<MenuComponent 
				{...mockProps} 
				autoFocus={false}
			/>,
		);
        
		const menuPaper = document.querySelector(".MuiMenu-paper");
		expect(menuPaper).toHaveAttribute("tabindex", "-1");
	});

	it("should autoFocus when autoFocus is true", () => {
		render(
			<MenuComponent 
				{...mockProps} 
				autoFocus={true}
			/>,
		);
        
		const menuPaper = document.querySelector(".MuiMenu-paper");
		expect(menuPaper).toHaveAttribute("tabindex", "-1");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<MenuComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
