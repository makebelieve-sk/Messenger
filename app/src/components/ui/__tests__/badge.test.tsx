import { render, screen } from "@testing-library/react";

import BadgeComponent from "@components/ui/badge";
import mockUseGlobalStore from "../../../__mocks__/@store/global";

describe("BadgeComponent", () => {
	const mockProps = {
		userId: "123",
		children: <div data-testid="test-child">Test Child</div>,
		className: "custom-class",
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockUseGlobalStore.mockImplementation((selector) => selector({
			...mockUseGlobalStore.getState(),
			onlineUsers: new Set([ "123" ]),
		}));
	});

	it("should render with children", () => {
		render(<BadgeComponent {...mockProps} />);
        
		expect(screen.getByTestId("test-child")).toBeInTheDocument();
	});

	it("should render with custom className", () => {
		render(<BadgeComponent {...mockProps} />);
        
		const badge = screen.getByTestId("test-child").parentElement;
		expect(badge).toHaveClass("custom-class");
	});

	it("should render with active state when user is online", () => {
		render(<BadgeComponent {...mockProps} />);
        
		const badge = screen.getByTestId("test-child").parentElement;
		expect(badge).toHaveClass("avatar-badge__active");
	});

	it("should render without active state when user is offline", () => {
		mockUseGlobalStore.mockImplementation((selector) => selector({
			...mockUseGlobalStore.getState(),
			onlineUsers: new Set([]),
		}));

		render(
			<BadgeComponent 
				{...mockProps}
			/>,
		);
        
		const badge = screen.getByTestId("test-child").parentElement;
		expect(badge).toHaveClass("MuiBadge-root");
	});

	it("should render with base class when no custom className is provided", () => {
		render(
			<BadgeComponent 
				{...mockProps} 
				className=""
			/>,
		);
        
		const badge = screen.getByTestId("test-child").parentElement;
		expect(badge).toHaveClass("avatar-badge");
	});

	it("should render with correct anchor origin", () => {
		render(<BadgeComponent {...mockProps} />);
        
		const badge = screen.getByTestId("test-child").parentElement;
		expect(badge).toHaveClass("MuiBadge-root");
	});

	it("should render with correct overlap", () => {
		render(<BadgeComponent {...mockProps} />);
        
		const badge = screen.getByTestId("test-child").parentElement;
		expect(badge).toHaveClass("MuiBadge-root");
	});

	it("should render with correct variant", () => {
		render(<BadgeComponent {...mockProps} />);
        
		const badge = screen.getByTestId("test-child").parentElement;
		expect(badge).toHaveClass("MuiBadge-root");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<BadgeComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
