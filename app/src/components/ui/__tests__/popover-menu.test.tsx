import { fireEvent, render, screen } from "@testing-library/react";

import PopoverMenu from "@components/ui/popover-menu";

describe("PopoverMenu", () => {
	const mockAnchorEl = document.createElement("div");
	const mockOnClose = jest.fn();
	const mockItemClick = jest.fn();
    
	const mockProps = {
		id: "test-menu",
		anchorEl: mockAnchorEl,
		anchorOrigin: {
			vertical: "top" as const,
			horizontal: "left" as const,
		},
		open: true,
		onClose: mockOnClose,
		items: [
			{
				onClick: mockItemClick,
				title: "Test Item 1",
				className: "custom-class",
			},
			{
				onClick: mockItemClick,
				title: "Test Item 2",
				icon: <span>Icon</span>,
			},
		],
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render menu items", () => {
		render(<PopoverMenu {...mockProps} />);
		expect(screen.getByText("Test Item 1")).toBeInTheDocument();
		expect(screen.getByText("Test Item 2")).toBeInTheDocument();
	});

	it("should render menu items with icons", () => {
		render(<PopoverMenu {...mockProps} />);
		expect(screen.getByText("Icon")).toBeInTheDocument();
	});

	it("should call onClick and onClose when menu item is clicked", () => {
		render(<PopoverMenu {...mockProps} />);
		fireEvent.click(screen.getByText("Test Item 1"));
		expect(mockItemClick).toHaveBeenCalled();
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("should apply custom className to menu item", () => {
		render(<PopoverMenu {...mockProps} />);
		const menuItem = screen.getByText("Test Item 1").closest(".custom-class");
		expect(menuItem).toBeInTheDocument();
	});

	it("should not render when open is false", () => {
		render(<PopoverMenu {...mockProps} open={false} />);
		expect(screen.queryByText("Test Item 1")).not.toBeInTheDocument();
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<PopoverMenu {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
