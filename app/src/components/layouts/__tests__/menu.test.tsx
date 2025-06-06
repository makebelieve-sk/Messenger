import { fireEvent, render, screen } from "@testing-library/react";

import MenuComponent from "@components/layouts/menu";
import { Pages } from "@custom-types/enums";
import { mockMainApi } from "../../../__mocks__/@hooks/useMainClient";
import { mockNavigate } from "../../../__mocks__/react-router-dom";

describe("MenuComponent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const renderComponent = () => {
		return render(<MenuComponent />);
	};

	it("renders menu with all navigation items", () => {
		renderComponent();
    
		const menuItems = screen.getAllByTestId("menu-item");
		expect(menuItems).toHaveLength(4);
    
		expect(screen.getByTestId("AccountCircleOutlinedIcon")).toBeInTheDocument();
		expect(screen.getByTestId("MessageOutlinedIcon")).toBeInTheDocument();
		expect(screen.getByTestId("PeopleOutlinedIcon")).toBeInTheDocument();
		expect(screen.getByTestId("CameraAltIcon")).toBeInTheDocument();
	});

	it("calls API methods for notifications on mount", () => {
		renderComponent();
    
		expect(mockMainApi.getFriendsNotification).toHaveBeenCalled();
		expect(mockMainApi.getMessageNotification).toHaveBeenCalled();
	});

	it("navigates to profile page when clicking profile menu item", () => {
		renderComponent();
    
		const menuItems = screen.getAllByTestId("menu-item");
		fireEvent.click(menuItems[0]);
    
		expect(mockNavigate).toHaveBeenCalledWith(Pages.profile);
	});

	it("navigates to messages page when clicking messenger menu item", () => {
		renderComponent();
    
		const menuItems = screen.getAllByTestId("menu-item");
		fireEvent.click(menuItems[1]);
    
		expect(mockNavigate).toHaveBeenCalledWith(Pages.messages);
	});

	it("navigates to friends page when clicking friends menu item", () => {
		renderComponent();
    
		const menuItems = screen.getAllByTestId("menu-item");
		fireEvent.click(menuItems[2]);
    
		expect(mockNavigate).toHaveBeenCalledWith(Pages.friends);
	});

	it("navigates to photos page when clicking photos menu item", () => {
		renderComponent();
    
		const menuItems = screen.getAllByTestId("menu-item");
		fireEvent.click(menuItems[3]);
    
		expect(mockNavigate).toHaveBeenCalledWith(Pages.photos);
	});

	it("displays correct translations for menu items", () => {
		renderComponent();
    
		const menuItems = screen.getAllByTestId("menu-item");
		expect(menuItems[0].querySelector(".menu__nav__item__title")).toHaveTextContent("My profile");
		expect(menuItems[1].querySelector(".menu__nav__item__title")).toHaveTextContent("Messanger");
		expect(menuItems[2].querySelector(".menu__nav__item__title")).toHaveTextContent("Friends");
		expect(menuItems[3].querySelector(".menu__nav__item__title")).toHaveTextContent("Photos");
		expect(screen.getByText("To developers")).toBeInTheDocument();
	});

	it("renders notification badges with correct content", () => {
		renderComponent();
    
		const badges = screen.getAllByTestId("menu-item").filter(item => 
			item.querySelector(".notification-badge"),
		);
		expect(badges).toHaveLength(2);
		badges.forEach(badge => {
			const notificationBadge = badge.querySelector(".notification-badge");
			expect(notificationBadge).toBeInTheDocument();
		});
	});

	it("matches snapshot", () => {
		const { container } = renderComponent();
		expect(container).toMatchSnapshot();
	});
});
