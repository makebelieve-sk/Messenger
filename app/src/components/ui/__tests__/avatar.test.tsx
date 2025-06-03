import { render, screen } from "@testing-library/react";

import AvatarComponent from "@components/ui/avatar";

describe("AvatarComponent", () => {
	const mockProps = {
		src: "https://example.com/avatar.jpg",
		alt: "Test Avatar",
		userId: "123",
		id: "test-avatar",
		className: "custom-class",
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render with avatar image", () => {
		render(<AvatarComponent {...mockProps} />);
        
		const avatar = screen.getByRole("img");
		expect(avatar).toBeInTheDocument();
		expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
		expect(avatar).toHaveAttribute("alt", mockProps.alt);
	});

	it("should render with custom className", () => {
		render(<AvatarComponent {...mockProps} />);
        
		const avatar = screen.getByRole("img").parentElement;
		expect(avatar).toHaveClass("custom-class");
	});

	it("should render with custom id", () => {
		render(<AvatarComponent {...mockProps} />);
        
		const avatar = screen.getByRole("img").parentElement;
		expect(avatar).toHaveAttribute("id", mockProps.id);
	});

	it("should render with null src", () => {
		render(
			<AvatarComponent 
				{...mockProps} 
				src={null}
			/>,
		);
        
		const avatar = screen.getByRole("img");
		expect(avatar).toHaveAttribute("src", "/assets/images/noPhoto.jpg");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<AvatarComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
