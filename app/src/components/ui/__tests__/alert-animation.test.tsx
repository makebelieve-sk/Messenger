import { act, render, screen } from "@testing-library/react";

import AlertAnimationComponent from "@components/ui/alert-animation";
import { ALERT_TIMEOUT } from "@utils/constants";

describe("AlertAnimationComponent", () => {
	const mockOnExited = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("should not render when show is false", () => {
		const { container } = render(
			<AlertAnimationComponent show={false} onExited={mockOnExited}>
                Test alert
			</AlertAnimationComponent>,
		);
		expect(container).toBeEmptyDOMElement();
	});

	it("should render when show is true", () => {
		render(
			<AlertAnimationComponent show={true} onExited={mockOnExited}>
                Test alert
			</AlertAnimationComponent>,
		);
        
		expect(screen.getByText("Test alert")).toBeInTheDocument();
	});

	it("should render with default success status", () => {
		render(
			<AlertAnimationComponent show={true} onExited={mockOnExited}>
                Test alert
			</AlertAnimationComponent>,
		);
        
		const alert = screen.getByRole("alert");
		expect(alert).toHaveClass("MuiAlert-standardSuccess");
	});

	it("should render with custom status", () => {
		render(
			<AlertAnimationComponent 
				show={true} 
				onExited={mockOnExited}
				status="error"
			>
                Test alert
			</AlertAnimationComponent>,
		);
        
		const alert = screen.getByRole("alert");
		expect(alert).toHaveClass("MuiAlert-standardError");
	});

	it("should render with custom severity", () => {
		render(
			<AlertAnimationComponent 
				show={true} 
				onExited={mockOnExited}
				status="warning"
			>
                Test alert
			</AlertAnimationComponent>,
		);
        
		const alert = screen.getByRole("alert");
		expect(alert).toHaveClass("MuiAlert-standardWarning");
	});

	it("should render with custom className", () => {
		render(
			<AlertAnimationComponent 
				show={true} 
				onExited={mockOnExited}
				className="custom-class"
			>
                Test alert
			</AlertAnimationComponent>,
		);
        
		const alert = screen.getByRole("alert");
		expect(alert).toHaveClass("custom-class");
	});

	it("should call onExited after timeout when show is true", () => {
		render(
			<AlertAnimationComponent show={true} onExited={mockOnExited}>
                Test alert
			</AlertAnimationComponent>,
		);
        
		act(() => {
			jest.advanceTimersByTime(ALERT_TIMEOUT);
		});
        
		expect(mockOnExited).toHaveBeenCalled();
	});

	it("should not call onExited when show is false", () => {
		render(
			<AlertAnimationComponent show={false} onExited={mockOnExited}>
                Test alert
			</AlertAnimationComponent>,
		);
        
		act(() => {
			jest.advanceTimersByTime(ALERT_TIMEOUT);
		});
        
		expect(mockOnExited).not.toHaveBeenCalled();
	});

	it("should clear timeout when component unmounts", () => {
		const { unmount } = render(
			<AlertAnimationComponent show={true} onExited={mockOnExited}>
                Test alert
			</AlertAnimationComponent>,
		);
        
		unmount();
        
		act(() => {
			jest.advanceTimersByTime(ALERT_TIMEOUT);
		});
        
		expect(mockOnExited).not.toHaveBeenCalled();
	});

	it("should clear timeout when show changes to false", () => {
		const { rerender } = render(
			<AlertAnimationComponent show={true} onExited={mockOnExited}>
                Test alert
			</AlertAnimationComponent>,
		);
        
		rerender(
			<AlertAnimationComponent show={false} onExited={mockOnExited}>
                Test alert
			</AlertAnimationComponent>,
		);
        
		act(() => {
			jest.advanceTimersByTime(ALERT_TIMEOUT);
		});
        
		expect(mockOnExited).not.toHaveBeenCalled();
	});

	it("matches snapshot", () => {
		const { asFragment } = render(
			<AlertAnimationComponent show={true} onExited={mockOnExited}>
                Test alert
			</AlertAnimationComponent>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
});
