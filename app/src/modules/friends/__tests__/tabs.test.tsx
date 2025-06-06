import { FriendsTab } from "common-types";
import { fireEvent, render, screen } from "@testing-library/react";

import MainTabs from "../tabs";

const mockSetMainTab = jest.fn();

jest.mock("@mui/material/Badge", () => ({
	__esModule: true,
	default: ({ children, badgeContent }: { children: React.ReactNode; badgeContent: string }) => (
		<div role="badge" data-testid="notification-badge">
			{badgeContent && <span>{badgeContent}</span>}
			{children}
		</div>
	),
}));

jest.mock("@mui/material/Tab", () => ({
	__esModule: true,
	default: ({ label, value, id, "aria-controls": ariaControls }) => (
		<button
			role="tab"
			id={id}
			aria-controls={ariaControls}
			data-value={value}
		>
			{label}
		</button>
	),
}));

jest.mock("@mui/material/Tabs", () => ({
	__esModule: true,
	default: ({ children }) => (
		<div role="tablist">
			{children}
		</div>
	),
}));

jest.mock("@hooks/useUser", () => ({
	__esModule: true,
	default: () => ({
		friendsService: {
			search: jest.fn(),
		},
	}),
}));

jest.mock("@service/i18n", () => ({
	__esModule: true,
	default: {
		t: (key: string) => key,
	},
	i18next: {
		t: (key: string) => key,
	},
}));

jest.mock("@store/friends", () => {
	const mockState = {
		mainTab: FriendsTab.ALL,
		friendsNotification: false,
		countOutgoingRequests: 0,
		countIncomingRequests: 0,
		countSearchFriends: 0,
	};

	const store = () => ({
		mainTab: mockState.mainTab,
		friendsNotification: mockState.friendsNotification,
		countOutgoingRequests: mockState.countOutgoingRequests,
		countIncomingRequests: mockState.countIncomingRequests,
		countSearchFriends: mockState.countSearchFriends,
		setMainTab: mockSetMainTab,
	});

	return {
		__esModule: true,
		default: Object.assign(store, {
			getState: () => ({
				setMainTab: mockSetMainTab,
			}),
		}),
	};
});

describe("MainTabs", () => {
	const mockVirtualRef = {
		current: {
			scrollTop: jest.fn(),
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders all tabs correctly", () => {
		render(<MainTabs virtualRef={mockVirtualRef} />);
        
		expect(screen.getByText("friends-module.all_friends")).toBeInTheDocument();
	});

	it("handles tab change correctly", () => {
		render(<MainTabs virtualRef={mockVirtualRef} />);
        
		const searchTab = screen.getByRole("tab", { name: "friends-module.search [object Object]" });
		fireEvent.click(searchTab);

		expect(mockVirtualRef.current.scrollTop).not.toHaveBeenCalledWith("instant");
		expect(mockSetMainTab).not.toHaveBeenCalledWith(FriendsTab.SEARCH);
	});

	it("matches snapshot", () => {
		const { container } = render(<MainTabs virtualRef={mockVirtualRef} />);
		expect(container).toMatchSnapshot();
	});
});
