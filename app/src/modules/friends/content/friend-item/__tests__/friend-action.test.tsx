import { FriendsTab } from "common-types";
import { useParams } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import useProfile from "@hooks/useProfile";
import useUser from "@hooks/useUser";
import useFriendsStore from "@store/friends";
import { IFriend } from "@custom-types/friends.types";
import FriendActions from "../friend-actions";

jest.mock("react-router-dom", () => ({
	useParams: jest.fn(),
}));

jest.mock("@hooks/useUser", () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock("@hooks/useProfile", () => ({
	__esModule: true,
	default: jest.fn(),
}));

let mockState = {
	mainTab: FriendsTab.ALL,
	contentTab: FriendsTab.MY,
	isLoadingAcceptAction: false,
	isLoadingLeftInFollowersAction: false,
	isLoadingDeleteFriendAction: false,
	isLoadingBlockFriendAction: false,
	isLoadingAddFriendAction: false,
	isLoadingUnfollowAction: false,
	isLoadingFollowAction: false,
	isLoadingUnblockAction: false,
};

const mockSetters = {
	setMainTab: jest.fn((tab) => { mockState.mainTab = tab; }),
	setContentTab: jest.fn((tab) => { mockState.contentTab = tab; }),
	setIsLoadingAcceptAction: jest.fn((value) => { mockState.isLoadingAcceptAction = value; }),
	setIsLoadingLeftInFollowersAction: jest.fn((value) => { mockState.isLoadingLeftInFollowersAction = value; }),
	setIsLoadingDeleteFriendAction: jest.fn((value) => { mockState.isLoadingDeleteFriendAction = value; }),
	setIsLoadingBlockFriendAction: jest.fn((value) => { mockState.isLoadingBlockFriendAction = value; }),
	setIsLoadingAddFriendAction: jest.fn((value) => { mockState.isLoadingAddFriendAction = value; }),
	setIsLoadingUnfollowAction: jest.fn((value) => { mockState.isLoadingUnfollowAction = value; }),
	setIsLoadingFollowAction: jest.fn((value) => { mockState.isLoadingFollowAction = value; }),
	setIsLoadingUnblockAction: jest.fn((value) => { mockState.isLoadingUnblockAction = value; }),
};

jest.mock("@store/friends", () => {
	const store = (selector) => {
		const state = { ...mockState, ...mockSetters };
		return selector ? selector(state) : state;
	};
	store.getState = () => ({ ...mockState, ...mockSetters });
	return {
		__esModule: true,
		default: store,
	};
});

jest.mock("@service/i18n", () => ({
	t: jest.fn((key) => key),
}));

describe("FriendActions Component", () => {
	const mockFriend: IFriend = {
		id: "123",
		fullName: "John Doe",
		avatarUrl: "avatar.jpg",
		avatarCreateDate: new Date().toISOString(),
		createdAt: new Date().toISOString(),
	};

	const mockFriendsService = {
		writeMessage: jest.fn(),
		addFriend: jest.fn(),
		accept: jest.fn(),
		leftInFollowers: jest.fn(),
		unfollow: jest.fn(),
		followFriend: jest.fn(),
		unblock: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockState = {
			mainTab: FriendsTab.ALL,
			contentTab: FriendsTab.MY,
			isLoadingAcceptAction: false,
			isLoadingLeftInFollowersAction: false,
			isLoadingDeleteFriendAction: false,
			isLoadingBlockFriendAction: false,
			isLoadingAddFriendAction: false,
			isLoadingUnfollowAction: false,
			isLoadingFollowAction: false,
			isLoadingUnblockAction: false,
		};
		(useParams as jest.Mock).mockReturnValue({ userId: "123" });
		(useProfile as jest.Mock).mockReturnValue({ isMe: true });
		(useUser as jest.Mock).mockReturnValue({ friendsService: mockFriendsService });
	});

	it("should render write message action for MY tab", () => {
		useFriendsStore.getState().setMainTab(FriendsTab.ALL);
		useFriendsStore.getState().setContentTab(FriendsTab.MY);
		useFriendsStore.getState().setIsLoadingDeleteFriendAction(false);
		useFriendsStore.getState().setIsLoadingBlockFriendAction(false);

		render(<FriendActions friend={mockFriend} />);
		const writeMessageButton = screen.getByText("friends-module.actions.write_message");
		expect(writeMessageButton).toBeInTheDocument();
	});

	it("should call writeMessage when write message button is clicked", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.ALL);
		state.setContentTab(FriendsTab.MY);
		state.setIsLoadingDeleteFriendAction(false);
		state.setIsLoadingBlockFriendAction(false);

		render(<FriendActions friend={mockFriend} />);
		const writeMessageButton = screen.getByText("friends-module.actions.write_message");
		fireEvent.click(writeMessageButton);
		expect(mockFriendsService.writeMessage).toHaveBeenCalledWith(mockFriend.id);
	});

	it("should match snapshot for MY tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.ALL);
		state.setContentTab(FriendsTab.MY);
		state.setIsLoadingDeleteFriendAction(false);
		state.setIsLoadingBlockFriendAction(false);

		const { container } = render(<FriendActions friend={mockFriend} />);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot for FOLLOWERS tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.FOLLOWERS);
		state.setIsLoadingAddFriendAction(false);

		const { container } = render(<FriendActions friend={mockFriend} />);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot for INCOMING_REQUESTS tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.INCOMING_REQUESTS);
		state.setIsLoadingAcceptAction(false);
		state.setIsLoadingLeftInFollowersAction(false);

		const { container } = render(<FriendActions friend={mockFriend} />);
		expect(container).toMatchSnapshot();
	});

	it("should render add friend action for FOLLOWERS tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.FOLLOWERS);
		state.setIsLoadingAddFriendAction(false);

		render(<FriendActions friend={mockFriend} />);
		const addFriendButton = screen.getByText("friends-module.actions.add_friend");
		expect(addFriendButton).toBeInTheDocument();
	});

	it("should call addFriend when add friend button is clicked in FOLLOWERS tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.FOLLOWERS);
		state.setIsLoadingAddFriendAction(false);

		render(<FriendActions friend={mockFriend} />);
		const addFriendButton = screen.getByText("friends-module.actions.add_friend");
		fireEvent.click(addFriendButton);
		expect(mockFriendsService.addFriend).toHaveBeenCalledWith(mockFriend.id);
	});

	it("should render accept and decline actions for INCOMING_REQUESTS tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.INCOMING_REQUESTS);
		state.setIsLoadingAcceptAction(false);
		state.setIsLoadingLeftInFollowersAction(false);

		render(<FriendActions friend={mockFriend} />);
		const acceptButton = screen.getByText("friends-module.actions.accept");
		const declineButton = screen.getByText("friends-module.actions.decline");
		expect(acceptButton).toBeInTheDocument();
		expect(declineButton).toBeInTheDocument();
	});

	it("should call accept when accept button is clicked in INCOMING_REQUESTS tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.INCOMING_REQUESTS);
		state.setIsLoadingAcceptAction(false);
		state.setIsLoadingLeftInFollowersAction(false);

		render(<FriendActions friend={mockFriend} />);
		const acceptButton = screen.getByText("friends-module.actions.accept");
		fireEvent.click(acceptButton);
		expect(mockFriendsService.accept).toHaveBeenCalledWith(mockFriend.id);
	});

	it("should call leftInFollowers when decline button is clicked in INCOMING_REQUESTS tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.INCOMING_REQUESTS);
		state.setIsLoadingAcceptAction(false);
		state.setIsLoadingLeftInFollowersAction(false);

		render(<FriendActions friend={mockFriend} />);
		const declineButton = screen.getByText("friends-module.actions.decline");
		fireEvent.click(declineButton);
		expect(mockFriendsService.leftInFollowers).toHaveBeenCalledWith(mockFriend.id);
	});

	it("should render unfollow action for OUTGOING_REQUESTS tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.OUTGOING_REQUESTS);
		state.setIsLoadingUnfollowAction(false);

		render(<FriendActions friend={mockFriend} />);
		const unfollowButton = screen.getByText("friends-module.actions.unfollow");
		expect(unfollowButton).toBeInTheDocument();
	});

	it("should call unfollow when unfollow button is clicked in OUTGOING_REQUESTS tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.OUTGOING_REQUESTS);
		state.setIsLoadingUnfollowAction(false);

		render(<FriendActions friend={mockFriend} />);
		const unfollowButton = screen.getByText("friends-module.actions.unfollow");
		fireEvent.click(unfollowButton);
		expect(mockFriendsService.unfollow).toHaveBeenCalledWith(mockFriend.id);
	});

	it("should render add friend action for SEARCH tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.SEARCH);
		state.setIsLoadingFollowAction(false);

		render(<FriendActions friend={mockFriend} />);
		const addFriendButton = screen.getByText("friends-module.actions.add_friend");
		expect(addFriendButton).toBeInTheDocument();
	});

	it("should call followFriend when add friend button is clicked in SEARCH tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.SEARCH);
		state.setIsLoadingFollowAction(false);

		render(<FriendActions friend={mockFriend} />);
		const addFriendButton = screen.getByText("friends-module.actions.add_friend");
		fireEvent.click(addFriendButton);
		expect(mockFriendsService.followFriend).toHaveBeenCalledWith(mockFriend.id);
	});

	it("should render unblock action for BLOCKED tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.BLOCKED);
		state.setIsLoadingUnblockAction(false);

		render(<FriendActions friend={mockFriend} />);
		const unblockButton = screen.getByText("friends-module.actions.unblock");
		expect(unblockButton).toBeInTheDocument();
	});

	it("should call unblock when unblock button is clicked in BLOCKED tab", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.BLOCKED);
		state.setIsLoadingUnblockAction(false);

		render(<FriendActions friend={mockFriend} />);
		const unblockButton = screen.getByText("friends-module.actions.unblock");
		fireEvent.click(unblockButton);
		expect(mockFriendsService.unblock).toHaveBeenCalledWith(mockFriend.id);
	});

	it("should show loading state for write message action", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.ALL);
		state.setContentTab(FriendsTab.MY);
		state.setIsLoadingDeleteFriendAction(true);

		render(<FriendActions friend={mockFriend} />);
		const loadingSpinner = screen.getByTestId("spinner");
		expect(loadingSpinner).toBeInTheDocument();
	});

	it("should show loading state for add friend action", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.FOLLOWERS);
		state.setIsLoadingAddFriendAction(true);

		render(<FriendActions friend={mockFriend} />);
		const addFriendButton = screen.getByText("friends-module.actions.add_friend");
		expect(addFriendButton).toBeDisabled();
	});

	it("should show loading state for accept action", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.INCOMING_REQUESTS);
		state.setIsLoadingAcceptAction(true);

		render(<FriendActions friend={mockFriend} />);
		const acceptButton = screen.getByText("friends-module.actions.accept");
		expect(acceptButton).toBeDisabled();
	});

	it("should show loading state for decline action", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.INCOMING_REQUESTS);
		state.setIsLoadingLeftInFollowersAction(true);

		render(<FriendActions friend={mockFriend} />);
		const declineButton = screen.getByText("friends-module.actions.decline");
		expect(declineButton).toBeDisabled();
	});

	it("should show loading state for unfollow action", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.OUTGOING_REQUESTS);
		state.setIsLoadingUnfollowAction(true);

		render(<FriendActions friend={mockFriend} />);
		const unfollowButton = screen.getByText("friends-module.actions.unfollow");
		expect(unfollowButton).toBeDisabled();
	});

	it("should show loading state for follow action", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.SEARCH);
		state.setIsLoadingFollowAction(true);

		render(<FriendActions friend={mockFriend} />);
		const addFriendButton = screen.getByText("friends-module.actions.add_friend");
		expect(addFriendButton).toBeDisabled();
	});

	it("should show loading state for unblock action", () => {
		const state = useFriendsStore.getState();
		state.setMainTab(FriendsTab.BLOCKED);
		state.setIsLoadingUnblockAction(true);

		render(<FriendActions friend={mockFriend} />);
		const unblockButton = screen.getByText("friends-module.actions.unblock");
		expect(unblockButton).toBeDisabled();
	});
});
