import { FriendsTab } from "common-types";
import { act, render, screen } from "@testing-library/react";

import Friends from "@pages/Friends";
import i18next from "@service/i18n";
import mockFriendsStore from "../../__mocks__/@store/friends";
import mockUserStore from "../../__mocks__/@store/user";

import "../../__mocks__/react-i18next";

jest.mock("../../core/socket/validation", () => ({
	validateClientEmitEvent: jest.fn().mockReturnValue(true),
}));

jest.mock("@utils/constants", () => ({
	IS_MY_FRIENDS: [ FriendsTab.MY, FriendsTab.ONLINE ],
}));

jest.mock("@hooks/usePrepareAnotherUser", () => ({
	__esModule: true,
	default: () => ({
		isLoading: false,
		isExistProfile: true,
	}),
}));

jest.mock("@hooks/useProfile", () => ({
	__esModule: true,
	default: () => ({
		isMe: true,
	}),
}));

jest.mock("@hooks/useUser", () => ({
	__esModule: true,
	default: () => ({
		id: "123",
		fullName: "John Doe",
		avatarUrl: "",
		friendsService: {
			getFriends: jest.fn(),
		},
	}),
}));

jest.mock("@modules/friends/possible-friends", () => ({
	__esModule: true,
	default: () => (
		<div data-testid="possible-friends-container">
			<div className="block-title">{i18next.t("friends-module.possible_friends")}</div>
			<div className="possible-container__block">
				<div className="opacity-text">
					{i18next.t("friends-module.no_other_users")}
				</div>
			</div>
		</div>
	),
}));

jest.mock("@components/services/avatars/big-user-avatar", () => ({
	__esModule: true,
	default: () => <div data-testid="user-avatar" />,
}));

jest.mock("@components/ui/link", () => ({
	__esModule: true,
	default: ({ children, onClick }) => (
		<button onClick={onClick} className="friends-container__another-user__info__link">
			{children}
		</button>
	),
}));

describe("Friends Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		const userStore = mockUserStore.getState();
		userStore.user = {
			id: "123",
			firstName: "John",
			secondName: "",
			thirdName: "Doe",
			email: "john@example.com",
			phone: "+1234567890",
			avatarUrl: "",
			avatarCreateDate: "",
			fullName: "John Doe",
		};

		const friendsStore = mockFriendsStore.getState();
		friendsStore.mainTab = FriendsTab.ALL;
	});

	it("matches snapshot in initial state", async () => {
		const { container } = await act(async () => {
			return render(<Friends />);
		});
		expect(container).toMatchSnapshot();
	});

	it("shows loading spinner when profile is loading", async () => {
		jest.requireMock("@hooks/usePrepareAnotherUser").default = () => ({
			isLoading: true,
			isExistProfile: false,
		});

		const { container } = await act(async () => {
			return render(<Friends />);
		});
		expect(container).toMatchSnapshot();
		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});

	it("shows loading spinner when profile does not exist", async () => {
		jest.requireMock("@hooks/usePrepareAnotherUser").default = () => ({
			isLoading: false,
			isExistProfile: false,
		});

		const { container } = await act(async () => {
			return render(<Friends />);
		});
		expect(container).toMatchSnapshot();
		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});

	it("shows another user info when viewing someone else's friends", async () => {
		jest.requireMock("@hooks/useProfile").default = () => ({
			isMe: false,
		});

		jest.requireMock("@hooks/useUser").default = () => ({
			id: "123",
			fullName: "John Doe",
			avatarUrl: "",
			friendsService: {
				getFriends: jest.fn(),
			},
		});

		jest.requireMock("@hooks/usePrepareAnotherUser").default = () => ({
			isLoading: false,
			isExistProfile: true,
		});

		const { container } = await act(async () => {
			return render(<Friends />);
		});
		expect(container).toMatchSnapshot();
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Перейти к странице")).toBeInTheDocument();
	});

	it("shows possible friends section when on ALL tab and viewing own profile", async () => {
		const friendsStore = mockFriendsStore.getState();
		friendsStore.mainTab = FriendsTab.ALL;

		jest.requireMock("@hooks/usePrepareAnotherUser").default = () => ({
			isLoading: false,
			isExistProfile: true,
		});

		jest.requireMock("@hooks/useProfile").default = () => ({
			isMe: true,
		});

		const { container } = await act(async () => {
			return render(<Friends />);
		});
		expect(container).toMatchSnapshot();
		expect(screen.getByTestId("possible-friends-container")).toBeInTheDocument();
		expect(screen.getByText(i18next.t("friends-module.possible_friends"))).toBeInTheDocument();
	});

	it("hides possible friends section when on SEARCH tab", async () => {
		const friendsStore = mockFriendsStore.getState();
		friendsStore.mainTab = FriendsTab.SEARCH;

		const { container } = await act(async () => {
			return render(<Friends />);
		});
		expect(container).toMatchSnapshot();
		expect(screen.queryByText(i18next.t("friends-module.possible_friends"))).not.toBeInTheDocument();
		expect(screen.queryByTestId("possible-friends-container")).not.toBeInTheDocument();
	});
});
