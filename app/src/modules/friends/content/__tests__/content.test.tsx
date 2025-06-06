import { FriendsTab } from "common-types";
import { fireEvent, render, screen } from "@testing-library/react";

import useProfile from "@hooks/useProfile";
import useUser from "@hooks/useUser";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";
import Content from "../index";

jest.mock("@hooks/useProfile");
jest.mock("@hooks/useUser");
jest.mock("@store/friends");
jest.mock("@service/i18n");
jest.mock("../friends-list", () => () => <div data-testid="friends-list">Friends List</div>);

describe("Content Component", () => {
	const mockVirtualRef = {
		current: {
			scrollTop: jest.fn(),
		},
	};

	const mockFriendsService = {
		getFriends: jest.fn(),
	};

	const mockSetContentTab = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
        
		(i18next.t as unknown as jest.Mock).mockImplementation((key: string) => key);

		(useProfile as jest.Mock).mockReturnValue({
			isMe: true,
		});

		(useUser as jest.Mock).mockReturnValue({
			friendsService: mockFriendsService,
		});

		const mockState = {
			mainTab: FriendsTab.ALL,
			contentTab: FriendsTab.MY,
			friendsNotification: 0,
			countMyFriends: 10,
			countOnlineFriends: 5,
			countFollowers: 3,
			countBlockedFriends: 2,
			countCommonFriends: 4,
			setContentTab: mockSetContentTab,

			searchFriends: [],
			countSearchFriends: 0,
			hasMoreSearchFriends: false,
			isLoadingPossibleFriends: false,
			isLoadingFollowAction: false,
			searchPossibleFriends: "",

			incomingRequests: [],
			countIncomingRequests: 0,
			hasMoreIncomingRequests: false,
			isLoadingIncomingRequests: false,
			isLoadingLeftInFollowersAction: false,
			isLoadingAcceptAction: false,
			searchIncomingRequests: "",

			outgoingRequests: [],
			countOutgoingRequests: 0,
			hasMoreOutgoingRequests: false,
			isLoadingOutgoingRequests: false,
			isLoadingUnfollowAction: false,
			searchOutgoingRequests: "",

			myFriends: [],
			hasMoreMyFriends: false,
			isLoadingMyFriends: false,
			isLoadingDeleteFriendAction: false,
			isLoadingBlockFriendAction: false,
			searchMyFriends: "",

			onlineFriends: [],
			hasMoreOnlineFriends: false,
			isLoadingOnlineFriends: false,
			searchOnlineFriends: "",

			followers: [],
			hasMoreFollowers: false,
			isLoadingFollowers: false,
			isLoadingAddFriendAction: false,
			searchFollowers: "",

			blockedFriends: [],
			hasMoreBlockedFriends: false,
			isLoadingBlockedFriends: false,
			isLoadingUnblockAction: false,
			searchBlockedFriends: "",

			commonFriends: [],
			isLoadingCommonFriends: false,
			searchCommonFriends: "",
			hasMoreCommonFriends: false,

			setMainTab: jest.fn(),
			setFriendsNotification: jest.fn(),
			setAllCounts: jest.fn(),
			setPossibleFriends: jest.fn(),
			setIsLoadingPossibleFriends: jest.fn(),
			setIsLoadingFollowAction: jest.fn(),
			setSearchPossibleFriends: jest.fn(),
			setIncomingRequests: jest.fn(),
			setIsLoadingIncomingRequests: jest.fn(),
			setIsLoadingLeftInFollowersAction: jest.fn(),
			setIsLoadingAcceptAction: jest.fn(),
			setSearchIncomingRequests: jest.fn(),
			addFriendsNotification: jest.fn(),
			removeFriendsNotification: jest.fn(),
			setOutgoingRequests: jest.fn(),
			setIsLoadingOutgoingRequests: jest.fn(),
			setIsLoadingUnfollowAction: jest.fn(),
			setSearchOutgoingRequests: jest.fn(),
			setFollowers: jest.fn(),
			setIsLoadingFollowers: jest.fn(),
			setIsLoadingAddFriendAction: jest.fn(),
			setSearchFollowers: jest.fn(),
			setMyFriends: jest.fn(),
			setIsLoadingMyFriends: jest.fn(),
			setIsLoadingDeleteFriendAction: jest.fn(),
			setIsLoadingBlockFriendAction: jest.fn(),
			setSearchMyFriends: jest.fn(),
			setBlockedFriends: jest.fn(),
			setIsLoadingBlockFriends: jest.fn(),
			setIsLoadingUnblockAction: jest.fn(),
			setSearchBlockedFriends: jest.fn(),
			setCommonFriends: jest.fn(),
			setIsLoadingCommonFriends: jest.fn(),
			setSearchCommonFriends: jest.fn(),
			setOnlineFriends: jest.fn(),
			setIsLoadingOnlineFriends: jest.fn(),
			setSearchOnlineFriends: jest.fn(),
			reset: jest.fn(),
		};

		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			if (typeof selector === "function") {
				return selector(mockState);
			}
			return mockState;
		});

		useFriendsStore.getState = () => mockState;
	});

	const renderComponent = () => {
		return render(<Content virtualRef={mockVirtualRef} />);
	};

	it("renders correctly with own profile", () => {
		const { container } = renderComponent();
		expect(container).toMatchSnapshot();
	});

	it("renders correctly with other user's profile", () => {
		(useProfile as jest.Mock).mockReturnValue({
			isMe: false,
		});
		const { container } = renderComponent();
		expect(container).toMatchSnapshot();
	});

	it("shows correct tabs for own profile", () => {
		renderComponent();
        
		expect(screen.getByText("friends-module.my_friends 10")).toBeInTheDocument();
		expect(screen.getByText("friends-module.online_friends 5")).toBeInTheDocument();
		expect(screen.getByText("friends-module.followers 3")).toBeInTheDocument();
		expect(screen.getByText("friends-module.blocked 2")).toBeInTheDocument();
	});

	it("shows correct tabs for other user's profile", () => {
		(useProfile as jest.Mock).mockReturnValue({
			isMe: false,
		});
		renderComponent();
        
		expect(screen.getByText("friends-module.all_friends 10")).toBeInTheDocument();
		expect(screen.getByText("friends-module.online_friends 5")).toBeInTheDocument();
		expect(screen.getByText("friends-module.followers 3")).toBeInTheDocument();
		expect(screen.getByText("friends-module.common_friends 4")).toBeInTheDocument();
	});

	it("handles tab change correctly", () => {
		renderComponent();
        
		const onlineTab = screen.getByText("friends-module.online_friends 5");
		fireEvent.click(onlineTab);

		expect(mockVirtualRef.current?.scrollTop).toHaveBeenCalledWith("instant");
		expect(mockSetContentTab).toHaveBeenCalledWith(FriendsTab.ONLINE);
	});

	it("calls getFriends when tab changes", async () => {
		renderComponent();
        
		const onlineTab = screen.getByText("friends-module.online_friends 5");
		fireEvent.click(onlineTab);

		await new Promise(resolve => setTimeout(resolve, 0));

		expect(mockFriendsService.getFriends).toHaveBeenCalled();
	});

	it("renders FriendsList component", () => {
		renderComponent();
		expect(screen.getByTestId("friends-list")).toBeInTheDocument();
	});
});
