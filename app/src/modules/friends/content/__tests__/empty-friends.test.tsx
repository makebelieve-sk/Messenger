import { FriendsTab } from "common-types";
import { useParams } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import useProfile from "@hooks/useProfile";
import useFriendsStore from "@store/friends";
import EmptyFriends from "../empty-friends";

jest.mock("react-router-dom", () => ({
	useParams: jest.fn(),
}));

jest.mock("@hooks/useProfile");
jest.mock("@store/friends", () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock("@service/i18n", () => ({
	t: (key: string) => key,
}));

jest.mock("@utils/constants", () => ({
	IS_MY_FRIENDS: [ FriendsTab.MY, FriendsTab.ONLINE ],
}));

describe("EmptyFriends Component", () => {
	const mockSetMainTab = jest.fn();
	const mockUseFriendsStore = useFriendsStore as unknown as jest.Mock & {
		getState: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(useParams as jest.Mock).mockReturnValue({ userId: "123" });
		(useProfile as jest.Mock).mockReturnValue({ isMe: true });
		mockUseFriendsStore.mockImplementation((selector) => {
			const state = {
				mainTab: FriendsTab.ALL,
				contentTab: FriendsTab.MY,
				setMainTab: mockSetMainTab,
			};
			return selector(state);
		});

		mockUseFriendsStore.getState = jest.fn().mockReturnValue({
			setMainTab: mockSetMainTab,
		});
	});

	it("should render correctly", () => {
		const { container } = render(<EmptyFriends />);
		expect(container).toMatchSnapshot();
	});

	it("should show search button when viewing own friends list", () => {
		render(<EmptyFriends />);
		const searchButton = screen.getByText("friends-module.actions.find_friends");
		expect(searchButton).toBeInTheDocument();
	});

	it("should not show search button when viewing other user's friends list", () => {
		(useProfile as jest.Mock).mockReturnValue({ isMe: false });
        
		render(<EmptyFriends />);
		const searchButton = screen.queryByText("friends-module.actions.find_friends");
		expect(searchButton).not.toBeInTheDocument();
	});

	it("should handle search button click correctly", () => {
		render(<EmptyFriends />);
		const searchButton = screen.getByText("friends-module.actions.find_friends");
        
		fireEvent.click(searchButton);
		expect(mockSetMainTab).toHaveBeenCalledWith(FriendsTab.SEARCH);
	});
});
