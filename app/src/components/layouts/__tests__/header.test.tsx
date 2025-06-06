import { fireEvent, render, screen } from "@testing-library/react";

import HeaderComponent from "@components/layouts/header";
import { Pages } from "@custom-types/enums";
import { BASE_URL } from "@utils/constants";
import { mockMainApi } from "../../../__mocks__/@hooks/useMainClient";
import mockUIStore from "../../../__mocks__/@store/ui";
import { mockNavigate } from "../../../__mocks__/react-router-dom";

describe("HeaderComponent", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const renderComponent = () => {
		return render(<HeaderComponent />);
	};

	it("renders header with all components", () => {
		renderComponent();
    
		expect(screen.getByTestId("main-logo")).toBeInTheDocument();
		expect(document.getElementById("user-avatar")).toBeInTheDocument();
	});

	it("opens menu when clicking on avatar", () => {
		renderComponent();
    
		const avatar = document.getElementById("user-avatar")?.parentElement;
		fireEvent.click(avatar!);
    
		expect(screen.getAllByTestId("menu-item")).toHaveLength(3);
	});

	it("navigates to profile page when clicking logo", () => {
		renderComponent();
    
		const logo = screen.getByTestId("main-logo").parentElement;
		fireEvent.click(logo!);
    
		expect(mockNavigate).toHaveBeenCalledWith(Pages.profile);
	});

	it("opens settings modal when clicking settings menu item", () => {
		renderComponent();
    
		const avatar = document.getElementById("user-avatar")?.parentElement;
		fireEvent.click(avatar!);
    
		const menuItems = screen.getAllByTestId("menu-item");
		fireEvent.click(menuItems[0]);
    
		expect(mockUIStore.getState().setSettingsModal).toHaveBeenCalledWith(true);
	});

	it("navigates to help page when clicking help menu item", () => {
		renderComponent();
    
		const avatar = document.getElementById("user-avatar")?.parentElement;
		fireEvent.click(avatar!);
    
		const menuItems = screen.getAllByTestId("menu-item");
		fireEvent.click(menuItems[1]);
    
		expect(mockNavigate).toHaveBeenCalledWith(Pages.help);
	});

	it("calls logout when clicking logout menu item", () => {
		renderComponent();
    
		const avatar = document.getElementById("user-avatar")?.parentElement;
		fireEvent.click(avatar!);
    
		const menuItems = screen.getAllByTestId("menu-item");
		fireEvent.click(menuItems[2]);
    
		expect(mockMainApi.logout).toHaveBeenCalled();
	});

	it("opens base URL in new tab when clicking logo with mouse wheel", () => {
		const originalOpen = window.open;
		window.open = jest.fn();
    
		renderComponent();
    
		const logo = screen.getByTestId("main-logo").parentElement;
		fireEvent.mouseDown(logo!, { button: 1 });
    
		expect(window.open).toHaveBeenCalledWith(BASE_URL);
    
		window.open = originalOpen;
	});

	it("matches snapshot in default state", () => {
		const { container } = renderComponent();
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with open menu", () => {
		const { container } = renderComponent();
		const avatar = document.getElementById("user-avatar")?.parentElement;
		fireEvent.click(avatar!);
		expect(container).toMatchSnapshot();
	});
});