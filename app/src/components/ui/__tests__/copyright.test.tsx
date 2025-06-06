import { fireEvent, render, screen } from "@testing-library/react";

import CopyrightComponent from "@components/ui/copyright";
import { Pages } from "@custom-types/enums";
import { mockNavigate } from "../../../__mocks__/react-router-dom";

describe("CopyrightComponent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render copyright text", () => {
		render(<CopyrightComponent />);
        
		const copyright = screen.getByTestId("copyright");
		expect(copyright).toHaveTextContent("©");
	});

	it("should render product name link", () => {
		render(<CopyrightComponent />);
        
		const link = screen.getByText("VK-CLON");
		expect(link).toBeInTheDocument();
	});

	it("should render current year", () => {
		render(<CopyrightComponent />);
        
		const copyright = screen.getByTestId("copyright");
		expect(copyright).toHaveTextContent(new Date().getFullYear().toString());
	});

	it("should navigate to about us page when link is clicked", () => {
		render(<CopyrightComponent />);
        
		const link = screen.getByText("VK-CLON");
		fireEvent.click(link);
        
		expect(mockNavigate).toHaveBeenCalledWith(Pages.aboutUs);
	});

	it("should have correct link href", () => {
		render(<CopyrightComponent />);
        
		const link = screen.getByText("VK-CLON");
		expect(link.closest("a")).toHaveAttribute("href", Pages.aboutUs);
	});

	it("should have correct styling", () => {
		render(<CopyrightComponent />);
        
		const copyright = screen.getByTestId("copyright");
		expect(copyright).toHaveClass("copyright");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<CopyrightComponent />);
		expect(asFragment()).toMatchSnapshot();
	});
});
