import { render } from "@testing-library/react";

import App from "@components/main/app";
import useUserStore, { type UserStore } from "../../../__mocks__/@store/user";

type MockUserStore = jest.Mock & {
    getState: () => UserStore;
};

describe("App Component", () => {
	const mockUser = {
		id: 1,
		name: "Test User",
		myAvatar: {
			userId: "123",
			src: "avatar.jpg",
			alt: "User Avatar",
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();
		const mockStore = {
			isUserLoading: false,
			user: null,
			userDetails: null,
			editUserDetails: null,
			myAvatar: null,
			setUser: jest.fn(),
			setLoadingUser: jest.fn(),
			setUserDetails: jest.fn(),
			setMyAvatar: jest.fn(),
			reset: jest.fn(),
			getState: () => mockStore,
		};
		const mockUseUserStore = useUserStore as unknown as MockUserStore;
		mockUseUserStore.mockImplementation((selector) => selector(mockStore));
		mockUseUserStore.getState = () => mockStore;
	});

	it("renders loading spinner when user is loading", () => {
		const mockStore = {
			isUserLoading: true,
			user: null,
			userDetails: null,
			editUserDetails: null,
			myAvatar: null,
			setUser: jest.fn(),
			setLoadingUser: jest.fn(),
			setUserDetails: jest.fn(),
			setMyAvatar: jest.fn(),
			reset: jest.fn(),
			getState: () => mockStore,
		};
		const mockUseUserStore = useUserStore as unknown as MockUserStore;
		mockUseUserStore.mockImplementation((selector) => selector(mockStore));
		mockUseUserStore.getState = () => mockStore;

		const { container } = render(<App />);
		expect(document.querySelector(".spinner")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("renders authenticated layout when user is loaded and authenticated", () => {
		const mockStore = {
			isUserLoading: false,
			user: mockUser,
			userDetails: null,
			editUserDetails: null,
			myAvatar: mockUser.myAvatar,
			setUser: jest.fn(),
			setLoadingUser: jest.fn(),
			setUserDetails: jest.fn(),
			setMyAvatar: jest.fn(),
			reset: jest.fn(),
			getState: () => mockStore,
		} as unknown as UserStore;
		const mockUseUserStore = useUserStore as unknown as MockUserStore;
		mockUseUserStore.mockImplementation((selector) => selector(mockStore));
		mockUseUserStore.getState = () => mockStore;

		const { container } = render(<App />);

		expect(container.querySelector(".header")).toBeInTheDocument();
		expect(container.querySelector(".menu")).toBeInTheDocument();
		expect(container.querySelector(".main-content")).toBeInTheDocument();

		expect(container.querySelector(".root__wrapper")).not.toHaveClass("root__no-auth");
		expect(container).toMatchSnapshot();
	});

	it("renders unauthenticated layout when user is loaded but not authenticated", () => {
		const mockStore = {
			isUserLoading: false,
			user: null,
			userDetails: null,
			editUserDetails: null,
			myAvatar: null,
			setUser: jest.fn(),
			setLoadingUser: jest.fn(),
			setUserDetails: jest.fn(),
			setMyAvatar: jest.fn(),
			reset: jest.fn(),
			getState: () => mockStore,
		};
		const mockUseUserStore = useUserStore as unknown as MockUserStore;
		mockUseUserStore.mockImplementation((selector) => selector(mockStore));
		mockUseUserStore.getState = () => mockStore;

		const { container } = render(<App />);

		expect(container.querySelector(".header")).not.toBeInTheDocument();
		expect(container.querySelector(".menu")).not.toBeInTheDocument();

		expect(container.querySelector(".main-content")).toBeInTheDocument();
		expect(container.querySelector(".root__wrapper")).toHaveClass("root__no-auth");
		expect(container).toMatchSnapshot();
	});
});
