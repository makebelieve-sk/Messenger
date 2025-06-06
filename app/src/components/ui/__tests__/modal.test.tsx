import { fireEvent, render, screen } from "@testing-library/react";

import ModalComponent from "@components/ui/modal";

describe("ModalComponent", () => {
	const mockOnClose = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should not render when open is false", () => {
		const { container } = render(
			<ModalComponent open={false} onClose={mockOnClose}>
				<div>Test content</div>
			</ModalComponent>,
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("should render when open is true", () => {
		render(
			<ModalComponent open={true} onClose={mockOnClose}>
				<div>Test content</div>
			</ModalComponent>,
		);
        
		expect(screen.getByTestId("modal-root")).toBeInTheDocument();
		expect(screen.getByText("Test content")).toBeInTheDocument();
	});

	it("should call onClose when clicking close icon", () => {
		render(
			<ModalComponent open={true} onClose={mockOnClose}>
				<div>Test content</div>
			</ModalComponent>,
		);
        
		const closeButton = screen.getByTestId("close-icon");
		fireEvent.click(closeButton);
        
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("should call onClose when clicking overlay", () => {
		render(
			<ModalComponent open={true} onClose={mockOnClose}>
				<div>Test content</div>
			</ModalComponent>,
		);
        
		const overlay = screen.getByTestId("modal-root");
		fireEvent.click(overlay);
        
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("should not call onClose when clicking content", () => {
		render(
			<ModalComponent open={true} onClose={mockOnClose}>
				<div>Test content</div>
			</ModalComponent>,
		);
        
		const content = screen.getByText("Test content");
		fireEvent.click(content);
        
		expect(mockOnClose).not.toHaveBeenCalled();
	});

	it("should render with extra content", () => {
		render(
			<ModalComponent 
				open={true} 
				onClose={mockOnClose}
				extraContent={<div>Extra content</div>}
			>
				<div>Test content</div>
			</ModalComponent>,
		);
        
		expect(screen.getByText("Extra content")).toBeInTheDocument();
	});

	it("should render with custom className", () => {
		render(
			<ModalComponent 
				open={true} 
				onClose={mockOnClose}
				className="custom-class"
			>
				<div>Test content</div>
			</ModalComponent>,
		);
        
		const modal = screen.getByTestId("modal-root");
		expect(modal).toHaveClass("custom-class");
	});

	it("should handle escape key press", () => {
		render(
			<ModalComponent open={true} onClose={mockOnClose}>
				<div>Test content</div>
			</ModalComponent>,
		);
        
		fireEvent.keyDown(document, { key: "Escape" });
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("should render with title and description", () => {
		render(
			<ModalComponent 
				open={true} 
				onClose={mockOnClose}
				title="modal-title"
				description="modal-description"
			>
				<div>Test content</div>
			</ModalComponent>,
		);
        
		const modal = screen.getByTestId("modal-root");
		expect(modal).toHaveAttribute("aria-labelledby", "modal-title");
		expect(modal).toHaveAttribute("aria-describedby", "modal-description");
	});

	it("should clean up event listeners on unmount", () => {
		const { unmount } = render(
			<ModalComponent open={true} onClose={mockOnClose}>
				<div>Test content</div>
			</ModalComponent>,
		);
        
		const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");
		unmount();
        
		expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
	});

	it("matches snapshot", () => {
		const { asFragment } = render(
			<ModalComponent 
				open={true} 
				onClose={mockOnClose}
				title="modal-title"
				description="modal-description"
				className="custom-class"
				extraContent={<div>Extra content</div>}
			>
				<div>Test content</div>
			</ModalComponent>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
}); 