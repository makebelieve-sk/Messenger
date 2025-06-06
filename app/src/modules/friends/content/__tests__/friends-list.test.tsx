import { FriendsTab } from "common-types";
import { createRef, ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import useUser from "@hooks/useUser";
import { type VirtualListHandle } from "@modules/virtual-list/list";
import useFriendsStore from "@store/friends";
import { IFriend } from "@custom-types/friends.types";
import FriendsList from "../friends-list";

jest.mock("@hooks/useUser");
jest.mock("@store/friends");
jest.mock("@service/i18n", () => ({
	t: (key: string) => key,
}));
jest.mock("@utils/constants", () => ({
	IS_MY_FRIENDS: [ FriendsTab.MY, FriendsTab.ONLINE ],
}));

const mockSetError = jest.fn();
jest.mock("@store/ui", () => ({
	getState: () => ({
		setError: mockSetError,
	}),
}));

jest.mock("@modules/friends/content/friend-item", () => {
	return function MockFriendItem({ friend }: { friend: IFriend }) {
		return <div data-testid="friend-item">{friend.fullName}</div>;
	};
});

jest.mock("@modules/friends/content/empty-friends", () => {
	return function MockEmptyFriends() {
		return <div data-testid="empty-friends">No friends</div>;
	};
});

jest.mock("@modules/virtual-list/list", () => {
	return function MockVirtualList({ items, renderCb }: { items: IFriend[], renderCb: (props: { item: IFriend }) => ReactNode }) {
		return (
			<div data-testid="virtual-list">
				{items.map((item, index) => (
					<div key={index}>{renderCb({ item })}</div>
				))}
			</div>
		);
	};
});

jest.mock("@components/ui/upper-button", () => {
	return function MockUpperButton({ onClick }: { onClick: () => void }) {
		return <button data-testid="upper-button" onClick={onClick}>Up</button>;
	};
});

describe("FriendsList Component", () => {
	const mockVirtualRef = createRef<VirtualListHandle>();
	const mockFriendsService = {
		loadMore: jest.fn(),
		search: jest.fn(),
	};

	beforeEach(() => {
		(useUser as unknown as jest.Mock).mockReturnValue({
			friendsService: mockFriendsService,
		});
	});

	it("should render empty state correctly", () => {
		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				mainTab: FriendsTab.ALL,
				contentTab: FriendsTab.MY,
				myFriends: [],
				isLoadingMyFriends: false,
				hasMoreMyFriends: false,
				searchMyFriends: "",
			};
			return selector(state);
		});

		const { container } = render(<FriendsList virtualRef={mockVirtualRef} />);
		expect(container).toMatchSnapshot();
		expect(screen.getByPlaceholderText("friends-module.search_placeholder")).toBeInTheDocument();
		expect(screen.getByTestId("empty-friends")).toBeInTheDocument();
	});

	it("should render list of friends correctly", () => {
		const mockFriends = [
			{
				id: "1",
				fullName: "John Doe",
				avatarUrl: "avatar1.jpg",
			},
			{
				id: "2",
				fullName: "Jane Smith",
				avatarUrl: "avatar2.jpg",
			},
		];
		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				mainTab: FriendsTab.ALL,
				contentTab: FriendsTab.MY,
				myFriends: mockFriends,
				isLoadingMyFriends: false,
				hasMoreMyFriends: true,
				searchMyFriends: "",
			};
			return selector(state);
		});

		const { container } = render(<FriendsList virtualRef={mockVirtualRef} />);
		expect(container).toMatchSnapshot();
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
	});

	it("should handle search input correctly", async () => {
		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				mainTab: FriendsTab.ALL,
				contentTab: FriendsTab.MY,
				myFriends: [],
				isLoadingMyFriends: false,
				hasMoreMyFriends: false,
				searchMyFriends: "",
			};
			return selector(state);
		});

		render(<FriendsList virtualRef={mockVirtualRef} />);
        
		const searchInput = screen.getByPlaceholderText("friends-module.search_placeholder");
		fireEvent.change(searchInput, { target: { value: "test" } });

		await waitFor(() => {
			expect(mockFriendsService.search).toHaveBeenCalledWith(FriendsTab.MY, "test");
		});
	});

	it("should handle loading state correctly", () => {
		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				mainTab: FriendsTab.ALL,
				contentTab: FriendsTab.MY,
				myFriends: [],
				isLoadingMyFriends: true,
				hasMoreMyFriends: false,
				searchMyFriends: "",
			};
			return selector(state);
		});

		const { container } = render(<FriendsList virtualRef={mockVirtualRef} />);
		expect(container).toMatchSnapshot();
	});

	it("should handle different friend list types correctly", () => {
		const mockFriends = [
			{
				id: "1",
				fullName: "John Doe",
				avatarUrl: "avatar1.jpg",
			},
		];

		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				mainTab: FriendsTab.ONLINE,
				contentTab: FriendsTab.MY,
				onlineFriends: mockFriends,
				isLoadingOnlineFriends: false,
				hasMoreOnlineFriends: false,
				searchOnlineFriends: "",
			};
			return selector(state);
		});

		const { container } = render(<FriendsList virtualRef={mockVirtualRef} />);
		expect(container).toMatchSnapshot();
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});

	it("should handle scroll behavior correctly", async () => {
		const mockFriends = Array(20).fill(null).map((_, index) => ({
			id: String(index),
			fullName: `Friend ${index}`,
			avatarUrl: `avatar${index}.jpg`,
		}));

		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				mainTab: FriendsTab.ALL,
				contentTab: FriendsTab.MY,
				myFriends: mockFriends,
				isLoadingMyFriends: false,
				hasMoreMyFriends: true,
				searchMyFriends: "",
			};
			return selector(state);
		});

		render(<FriendsList virtualRef={mockVirtualRef} />);

		const scrollEvent = new Event("scroll");
		Object.defineProperty(scrollEvent, "scrollOffset", { value: 700 });
		window.dispatchEvent(scrollEvent);

		await waitFor(() => {
			expect(mockFriendsService.loadMore).not.toHaveBeenCalled();
		});
	});

	it("should handle invalid tab correctly", () => {
		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				mainTab: "INVALID_TAB",
				contentTab: FriendsTab.MY,
				myFriends: [],
				isLoadingMyFriends: false,
				hasMoreMyFriends: false,
				searchMyFriends: "",
			};
			return selector(state);
		});

		render(<FriendsList virtualRef={mockVirtualRef} />);
		expect(mockSetError).toHaveBeenCalled();
	});

	it("should handle search value change correctly", async () => {
		const mockScrollTop = jest.fn();
		mockVirtualRef.current = {
			scrollTop: mockScrollTop,
		};

		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				mainTab: FriendsTab.ALL,
				contentTab: FriendsTab.MY,
				myFriends: [],
				isLoadingMyFriends: false,
				hasMoreMyFriends: false,
				searchMyFriends: "",
			};
			return selector(state);
		});

		render(<FriendsList virtualRef={mockVirtualRef} />);
        
		const searchInput = screen.getByPlaceholderText("friends-module.search_placeholder");
		fireEvent.change(searchInput, { target: { value: "test" } });

		expect(mockScrollTop).toHaveBeenCalledWith("smooth");
		expect(mockFriendsService.search).toHaveBeenCalledWith(FriendsTab.MY, "test");
	});

	it("should handle different friend list types correctly", () => {
		const mockFriends = [
			{
				id: "1",
				fullName: "John Doe",
				avatarUrl: "avatar1.jpg",
			},
		];

		const testCases = [
			{ tab: FriendsTab.FOLLOWERS, friends: mockFriends, isLoading: false, hasMore: false, search: "" },
			{ tab: FriendsTab.BLOCKED, friends: mockFriends, isLoading: false, hasMore: false, search: "" },
			{ tab: FriendsTab.OUTGOING_REQUESTS, friends: mockFriends, isLoading: false, hasMore: false, search: "" },
			{ tab: FriendsTab.INCOMING_REQUESTS, friends: mockFriends, isLoading: false, hasMore: false, search: "" },
			{ tab: FriendsTab.SEARCH, friends: mockFriends, isLoading: false, hasMore: false, search: "" },
			{ tab: FriendsTab.COMMON, friends: mockFriends, isLoading: false, hasMore: false, search: "" },
		];

		testCases.forEach(({ tab, friends, isLoading, hasMore, search }) => {
			(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
				const state = {
					mainTab: tab,
					contentTab: tab,
					[`${String(tab).toLowerCase()}Friends`]: friends,
					[`isLoading${String(tab)}Friends`]: isLoading,
					[`hasMore${String(tab)}Friends`]: hasMore,
					[`search${String(tab)}Friends`]: search,
				};
				return selector(state);
			});

			const { container } = render(<FriendsList virtualRef={mockVirtualRef} />);
			expect(container).toMatchSnapshot();
		});
	});
});
