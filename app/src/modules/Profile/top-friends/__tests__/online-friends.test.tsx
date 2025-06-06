import { render, screen } from "@testing-library/react";

import useProfile from "@hooks/useProfile";
import OnlineFriends from "@modules/profile/top-friends/online-friends";
import useFriendsStore from "@store/friends";
import { IUser } from "@custom-types/models.types";
import { mockProfileService } from "../../../../__mocks__/@hooks/useProfile";

jest.mock("@hooks/useProfile");
jest.mock("@store/friends");
jest.mock("react-router-dom", () => ({
	useNavigate: () => jest.fn(),
	useParams: () => ({ userId: "1" }),
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
		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => 
			selector({ 
				onlineFriends: [ mockUser ],
				setMainTab: jest.fn(),
				setContentTab: jest.fn(),
			}),
		);
	});

	it("renders with no online friends", () => {
		(useFriendsStore as unknown as jest.Mock).mockImplementation((selector) => 
			selector({ 
				onlineFriends: [],
				setMainTab: jest.fn(),
				setContentTab: jest.fn(),
			}),
		);
		const { container } = render(<OnlineFriends />);
		expect(container).toMatchSnapshot();
		expect(screen.getByTestId("no-data")).toBeInTheDocument();
	});

	it("calls getOnlineFriends on mount", () => {
		const { container } = render(<OnlineFriends />);
		expect(container).toMatchSnapshot();
		expect(mockProfileService.getOnlineFriends).toHaveBeenCalled();
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
});
