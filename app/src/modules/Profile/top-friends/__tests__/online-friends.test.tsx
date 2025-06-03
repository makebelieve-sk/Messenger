import { render, screen } from "@testing-library/react";

import useProfile from "@hooks/useProfile";
import OnlineFriends from "@modules/profile/top-friends/online-friends";
import useGlobalStore from "@store/global";
import { IUser } from "@custom-types/models.types";
import { mockProfileService } from "../../../../__mocks__/@hooks/useProfile";

jest.mock("@hooks/useProfile");
jest.mock("@store/global");
jest.mock("react-router-dom", () => ({
	useNavigate: () => jest.fn(),
}));

const mockUser: IUser = {
	id: "1",
	firstName: "John",
	secondName: "Doe",
	thirdName: "Smith",
	email: "john@example.com",
	phone: "1234567890",
	avatarUrl: "avatar1.jpg",
	avatarCreateDate: "2024-01-01",
	fullName: "John Doe Smith",
};

describe("OnlineFriends", () => {
	beforeEach(() => {
		(useProfile as jest.Mock).mockReturnValue(mockProfileService);
		const mockOnlineUsers = new Map<string, IUser>();
		mockOnlineUsers.set("1", mockUser);
		(useGlobalStore as unknown as jest.Mock).mockImplementation((selector) => 
			selector({ onlineUsers: mockOnlineUsers }),
		);
	});

	it("renders with no online friends", () => {
		(useGlobalStore as unknown as jest.Mock).mockImplementation((selector) => 
			selector({ onlineUsers: new Map<string, IUser>() }),
		);
		const { container } = render(<OnlineFriends />);
		expect(container).toMatchSnapshot();
		expect(screen.getByTestId("no-data")).toBeInTheDocument();
	});

	it("calls getFriends on mount", () => {
		const { container } = render(<OnlineFriends />);
		expect(container).toMatchSnapshot();
		expect(mockProfileService.getFriends).toHaveBeenCalled();
	});

	it("renders online friends count", () => {
		const { container } = render(<OnlineFriends />);
		expect(container).toMatchSnapshot();
		expect(screen.getByText("1")).toBeInTheDocument();
	});

	it("renders online friends title", () => {
		const { container } = render(<OnlineFriends />);
		expect(container).toMatchSnapshot();
		expect(screen.getByText("Online friends")).toBeInTheDocument();
	});

	it("renders online friend", () => {
		const { container } = render(<OnlineFriends />);
		expect(container).toMatchSnapshot();
		expect(screen.getByText("John")).toBeInTheDocument();
	});
});
