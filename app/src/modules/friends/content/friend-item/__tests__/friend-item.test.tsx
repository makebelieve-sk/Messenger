import { FriendsTab } from "common-types";
import { useParams } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import useProfile from "@hooks/useProfile";
import useUser from "@hooks/useUser";
import useFriendsStore from "@store/friends";
import { IFriend } from "@custom-types/friends.types";

import FriendItem from "..";

jest.mock("react-router-dom", () => ({
	useParams: jest.fn(),
	useNavigate: jest.fn(() => jest.fn()),
}));

jest.mock("@hooks/useUser", () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock("@hooks/useProfile", () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock("@store/friends", () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock("@service/i18n", () => ({
	t: jest.fn((key) => key),
}));

jest.mock("@utils/constants", () => ({
	IS_MY_FRIENDS: [ FriendsTab.MY, FriendsTab.ONLINE ],
}));

describe("FriendItem", () => {
	const mockFriend: IFriend = {
		id: "123",
		fullName: "John Doe",
		avatarUrl: "https://example.com/avatar.jpg",
		avatarCreateDate: new Date().toISOString(),
		createdAt: new Date().toISOString(),
	};

	const mockFriendsService = {
		deleteFriend: jest.fn(),
		blockFriend: jest.fn(),
		writeMessage: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
        
		(useParams as jest.Mock).mockReturnValue({ userId: "current-user-id" });
		(useUser as jest.Mock).mockReturnValue({ friendsService: mockFriendsService });
		(useProfile as jest.Mock).mockReturnValue({ isMe: true });
		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				mainTab: FriendsTab.MY,
				contentTab: FriendsTab.MY,
			};
			return selector(state);
		});
	});

	it("renders friend information correctly", () => {
		render(<FriendItem friend={mockFriend} />);
        
		expect(screen.getByAltText(mockFriend.fullName)).toBeInTheDocument();
		expect(screen.getByText(mockFriend.fullName)).toBeInTheDocument();
	});

	it("does not show popover menu when viewing other user's profile", () => {
		(useProfile as jest.Mock).mockReturnValue({ isMe: false });
        
		render(<FriendItem friend={mockFriend} />);
        
		expect(screen.queryByTestId("MoreHorizIcon")).not.toBeInTheDocument();
	});

	it("matches snapshot", () => {
		const { container } = render(<FriendItem friend={mockFriend} />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot when viewing other user's profile", () => {
		(useProfile as jest.Mock).mockReturnValue({ isMe: false });
        
		const { container } = render(<FriendItem friend={mockFriend} />);
		expect(container).toMatchSnapshot();
	});

	it("shows popover menu when clicking more icon", () => {
		render(<FriendItem friend={mockFriend} />);
        
		const moreIcon = screen.getByTestId("MoreHorizIcon");
		fireEvent.click(moreIcon);
        
		expect(screen.getByText("friends-module.actions.remove_friend")).toBeInTheDocument();
		expect(screen.getByText("friends-module.actions.block")).toBeInTheDocument();
	});

	it("calls deleteFriend when clicking remove friend option", () => {
		render(<FriendItem friend={mockFriend} />);
        
		const moreIcon = screen.getByTestId("MoreHorizIcon");
		fireEvent.click(moreIcon);
        
		const removeFriendOption = screen.getByText("friends-module.actions.remove_friend");
		fireEvent.click(removeFriendOption);
        
		expect(mockFriendsService.deleteFriend).toHaveBeenCalledWith(mockFriend.id);
	});

	it("calls blockFriend when clicking block option", () => {
		render(<FriendItem friend={mockFriend} />);
        
		const moreIcon = screen.getByTestId("MoreHorizIcon");
		fireEvent.click(moreIcon);
        
		const blockOption = screen.getByText("friends-module.actions.block");
		fireEvent.click(blockOption);
        
		expect(mockFriendsService.blockFriend).toHaveBeenCalledWith(mockFriend.id);
	});

	it("closes popover menu when clicking outside", () => {
		render(<FriendItem friend={mockFriend} />);
        
		const moreIcon = screen.getByTestId("MoreHorizIcon");
		fireEvent.click(moreIcon);
        
		expect(screen.getByText("friends-module.actions.remove_friend")).toBeInTheDocument();
        
		fireEvent.click(document.body);
        
		expect(screen.queryByText("friends-module.actions.remove_friend")).toBeInTheDocument();
	});

	it("shows friend actions when viewing own profile", () => {
		render(<FriendItem friend={mockFriend} />);
        
		expect(screen.getByText("friends-module.actions.write_message")).toBeInTheDocument();
	});

	it("does not show friend actions when viewing other user's profile", () => {
		(useProfile as jest.Mock).mockReturnValue({ isMe: false });
        
		render(<FriendItem friend={mockFriend} />);
        
		expect(screen.queryByText("friends-module.actions.write_message")).not.toBeInTheDocument();
	});
});
