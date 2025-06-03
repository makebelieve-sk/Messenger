import { act, fireEvent, render, screen } from "@testing-library/react";

import PersonalInfo from "@modules/profile/personal-info";
import { MainFriendTabs, Pages } from "@custom-types/enums";
import type { IUser, IUserDetails } from "@custom-types/models.types";
import useProfile from "../../../__mocks__/@hooks/useProfile";
import usePhotosStore from "../../../__mocks__/@store/photos";
import useUserStore from "../../../__mocks__/@store/user";

jest.mock("@service/i18n", () => ({
	t: (key: string) => key,
}));

jest.mock("react-router-dom", () => ({
	useNavigate: () => jest.fn(),
	useParams: () => ({ userId: "123" }),
}));

describe("PersonalInfo", () => {
	const mockProfile = {
		isMe: true,
		userService: {
			syncInfo: jest.fn(),
		},
	};

	const mockNavigate = jest.fn();

	beforeEach(() => {
		useUserStore.getState().user = {
			fullName: "Test User",
		} as IUser;
		useUserStore.getState().userDetails = {
			birthday: "1990-01-01",
			city: "Test City",
			work: "Test Work",
		} as IUserDetails;
		usePhotosStore.getState().isPhotosLoading = false;
		usePhotosStore.getState().count = 0;
		(useProfile as jest.Mock).mockReturnValue(mockProfile);
		jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(mockNavigate);
	});

	it("renders correctly", () => {
		const { container } = render(<PersonalInfo />);
		expect(container).toMatchSnapshot();
	});

	it("displays user information correctly", () => {
		render(<PersonalInfo />);

		expect(screen.getByText("Test User")).toBeInTheDocument();
		expect(screen.getByText("1990-01-01")).toBeInTheDocument();
		expect(screen.getByText("Test City")).toBeInTheDocument();
		expect(screen.getByText("Test Work")).toBeInTheDocument();
	});

	it("shows edit button for own profile", () => {
		render(<PersonalInfo />);
		const editButton = screen.getByText("profile-module.edit");
		expect(editButton).toBeInTheDocument();
	});

	it("does not show edit button for other user's profile", () => {
		(useProfile as jest.Mock).mockReturnValue({
			...mockProfile,
			isMe: false,
		});

		render(<PersonalInfo />);
		const editButton = screen.queryByText("profile-module.edit");
		expect(editButton).not.toBeInTheDocument();
	});

	it("shows loading spinner when photos are loading", () => {
		usePhotosStore.getState().isPhotosLoading = true;
		usePhotosStore.getState().count = 0;

		render(<PersonalInfo />);
		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});

	it("navigates to edit page when edit button is clicked", async () => {
		render(<PersonalInfo />);
		const editButton = screen.getByText("profile-module.edit");
    
		await act(async () => {
			fireEvent.click(editButton);
		});
    
		expect(mockNavigate).toHaveBeenCalledWith(Pages.edit);
	});

	it("navigates to friends page when friends count is clicked", async () => {
		render(<PersonalInfo />);
		const friendsCount = screen.getAllByText("0")[0];
    
		await act(async () => {
			fireEvent.click(friendsCount);
		});
    
		expect(mockNavigate).toHaveBeenCalledWith(Pages.friends, {
			state: { mainTab: MainFriendTabs.allFriends },
		});
	});

	it("navigates to photos page when photos count is clicked", async () => {
		render(<PersonalInfo />);
		const photosCount = screen.getAllByText("0")[2];
    
		await act(async () => {
			fireEvent.click(photosCount);
		});
    
		expect(mockNavigate).toHaveBeenCalledWith("/photos/123");
	});

	it("calls syncInfo on mount", () => {
		render(<PersonalInfo />);
		expect(mockProfile.userService.syncInfo).toHaveBeenCalled();
	});

	it("displays correct counts for all sections", () => {
		usePhotosStore.getState().count = 5;
		render(<PersonalInfo />);
    
		const counts = screen.getAllByText("0");
		expect(counts).toHaveLength(4); // Friends, Subscribers, Audios, Videos
    
		const photoCount = screen.getByText("5");
		expect(photoCount).toBeInTheDocument();
	});

	it("handles empty user details gracefully", () => {
		useUserStore.getState().userDetails = {} as IUserDetails;
		render(<PersonalInfo />);
    
		expect(screen.getByText("Test User")).toBeInTheDocument();
		expect(screen.queryByText("1990-01-01")).not.toBeInTheDocument();
		expect(screen.queryByText("Test City")).not.toBeInTheDocument();
		expect(screen.queryByText("Test Work")).not.toBeInTheDocument();
	});
});
