import { FriendsTab } from "common-types";
import { createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import useUser from "@hooks/useUser";
import { type VirtualListHandle } from "@modules/virtual-list/list";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";
import PossibleFriends from "../possible-friends";

jest.mock("@hooks/useUser");
jest.mock("@store/friends");
jest.mock("@service/i18n");

describe("PossibleFriends Component", () => {
	const mockVirtualRef = createRef<VirtualListHandle>();
	const mockFriendsService = {
		getFriends: jest.fn(),
		followFriend: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();

		(useUser as unknown as jest.Mock).mockReturnValue({
			friendsService: mockFriendsService,
		});

		(i18next.t as unknown as jest.Mock).mockImplementation((key: string) => key);

		const mockSetMainTab = jest.fn();
		const mockState = {
			searchFriends: [],
			isLoadingPossibleFriends: false,
			isLoadingFollowAction: false,
			setMainTab: mockSetMainTab,
		};

		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => selector(mockState));
		useFriendsStore.getState = () => ({
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			...mockState as any,
			setMainTab: mockSetMainTab,
		});
	});

	it("should render loading state correctly", () => {
		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				searchFriends: [],
				isLoadingPossibleFriends: true,
				isLoadingFollowAction: false,
				setMainTab: jest.fn(),
			};
			return selector(state);
		});

		render(<PossibleFriends virtualRef={mockVirtualRef} />);
        
		expect(screen.getByTestId("possible-friends-container")).toBeInTheDocument();
		expect(screen.getByText("friends-module.possible_friends")).toBeInTheDocument();
	});

	it("should render empty state correctly", () => {
		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				searchFriends: [],
				isLoadingPossibleFriends: false,
				isLoadingFollowAction: false,
				setMainTab: jest.fn(),
			};
			return selector(state);
		});

		render(<PossibleFriends virtualRef={mockVirtualRef} />);
        
		expect(screen.getByText("friends-module.no_other_users")).toBeInTheDocument();
	});

	it("should render list of possible friends correctly", () => {
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
				searchFriends: mockFriends,
				isLoadingPossibleFriends: false,
				isLoadingFollowAction: false,
				setMainTab: jest.fn(),
			};
			return selector(state);
		});

		render(<PossibleFriends virtualRef={mockVirtualRef} />);
        
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
		expect(screen.getAllByText("friends-module.add_to_friends")).toHaveLength(2);
	});

	it("should call followFriend when add button is clicked", async () => {
		const mockFriends = [ {
			id: "1",
			fullName: "John Doe",
			avatarUrl: "avatar1.jpg",
		} ];

		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				searchFriends: mockFriends,
				isLoadingPossibleFriends: false,
				isLoadingFollowAction: false,
				setMainTab: jest.fn(),
			};
			return selector(state);
		});

		render(<PossibleFriends virtualRef={mockVirtualRef} />);
        
		const addButton = screen.getByText("friends-module.add_to_friends");
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(mockFriendsService.followFriend).toHaveBeenCalledWith("1");
		});
	});

	it("should show loading state when follow action is in progress", () => {
		const mockFriends = [ {
			id: "1",
			fullName: "John Doe",
			avatarUrl: "avatar1.jpg",
		} ];

		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				searchFriends: mockFriends,
				isLoadingPossibleFriends: false,
				isLoadingFollowAction: true,
				setMainTab: jest.fn(),
			};
			return selector(state);
		});

		render(<PossibleFriends virtualRef={mockVirtualRef} />);
        
		expect(screen.queryByText("friends-module.add_to_friends")).not.toBeInTheDocument();
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
	});

	it("should call getFriends on mount", () => {
		render(<PossibleFriends virtualRef={mockVirtualRef} />);
        
		expect(mockFriendsService.getFriends).toHaveBeenCalledWith(FriendsTab.SEARCH);
	});

	it("should change main tab when title is clicked", () => {
		const mockSetMainTab = jest.fn();
		const mockState = {
			searchFriends: [],
			isLoadingPossibleFriends: false,
			isLoadingFollowAction: false,
			setMainTab: mockSetMainTab,
		};

		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => selector(mockState));
		useFriendsStore.getState = () => ({
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			...mockState as any,
			setMainTab: mockSetMainTab,
		});

		render(<PossibleFriends virtualRef={mockVirtualRef} />);
        
		const title = screen.getByText("friends-module.possible_friends");
		fireEvent.click(title);

		expect(mockSetMainTab).toHaveBeenCalledWith(FriendsTab.SEARCH);
	});

	it("should match snapshot", () => {
		const mockFriends = [ {
			id: "1",
			fullName: "John Doe",
			avatarUrl: "avatar1.jpg",
		} ];

		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => {
			const state = {
				searchFriends: mockFriends,
				isLoadingPossibleFriends: false,
				isLoadingFollowAction: false,
				setMainTab: jest.fn(),
			};
			return selector(state);
		});

		const { container } = render(<PossibleFriends virtualRef={mockVirtualRef} />);
		expect(container).toMatchSnapshot();
	});
});
