import { fireEvent, render, screen } from "@testing-library/react";

import LinkComponent from "@components/ui/link";

describe("LinkComponent", () => {
	const mockProps = {
		href: "https://example.com",
		children: "Test Link",
		onClick: jest.fn(),
		variant: "body2" as const,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render with href and children", () => {
		render(<LinkComponent {...mockProps} />);
        
		const link = screen.getByTestId("link");
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", mockProps.href);
		expect(link).toHaveTextContent(mockProps.children);
	});

	it("should call onClick when clicked", () => {
		render(<LinkComponent {...mockProps} />);
        
		const link = screen.getByTestId("link");
		fireEvent.click(link);
        
		expect(mockProps.onClick).toHaveBeenCalled();
	});

	it("should prevent default behavior when clicked", () => {
		render(<LinkComponent {...mockProps} />);
        
		const link = screen.getByTestId("link");
		const event = fireEvent.click(link);
        
		expect(event).toBe(false);
	});

	it("should render without href", () => {
		render(<LinkComponent onClick={mockProps.onClick} children={mockProps.children} />);
        
		const link = screen.getByTestId("link");
		expect(link).toBeInTheDocument();
		expect(link).not.toHaveAttribute("href");
	});

	it("should render without onClick", () => {
		render(<LinkComponent href={mockProps.href} children={mockProps.children} />);
        
		const link = screen.getByTestId("link");
		expect(link).toBeInTheDocument();
		fireEvent.click(link);
	});

	it("should apply variant prop", () => {
		render(<LinkComponent {...mockProps} />);
        
		const link = screen.getByTestId("link");
		expect(link).toHaveClass("MuiTypography-body2");
	});

	it("should render with custom className", () => {
		render(<LinkComponent {...mockProps} className="custom-class" />);
        
		const link = screen.getByTestId("link");
		expect(link).toHaveClass("custom-class");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<LinkComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
