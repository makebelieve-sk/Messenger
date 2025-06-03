import { act, render, screen } from "@testing-library/react";

import Profile from "@pages/Profile";
import mockProfileStore from "../../__mocks__/@store/profile";
import mockUserStore from "../../__mocks__/@store/user";

import "../../__mocks__/react-i18next";

jest.mock("@hooks/usePrepareAnotherUser", () => ({
	__esModule: true,
	default: () => ({
		isLoading: false,
		isExistProfile: true,
	}),
}));

describe("Profile Component", () => {
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
		userStore.userDetails = {
			birthday: "1990-01-01",
			city: "New York",
			work: "Developer",
			sex: "male",
			lastSeen: "2024-01-01",
			userId: "123",
		};

		const profileStore = mockProfileStore.getState();
		profileStore.isPrepareAnotherUser = false;
		profileStore.isMe = true;
	});

	it("matches snapshot in initial state", async () => {
		const { container } = await act(async () => {
			return render(<Profile />);
		});
		expect(container).toMatchSnapshot();
	});

	it("shows loading spinner when profile is loading", async () => {
		jest.requireMock("@hooks/usePrepareAnotherUser").default = () => ({
			isLoading: true,
			isExistProfile: false,
		});

		const { container } = await act(async () => {
			return render(<Profile />);
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
			return render(<Profile />);
		});
		expect(container).toMatchSnapshot();
		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});
});
