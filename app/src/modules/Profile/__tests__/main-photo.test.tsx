import { fireEvent, render, screen } from "@testing-library/react";

import MainPhoto from "@modules/profile/main-photo";
import useProfile from "../../../__mocks__/@hooks/useProfile";
import useProfileStore from "../../../__mocks__/@store/profile";

jest.mock("@service/i18n", () => ({
	t: (key: string) => key,
}));

describe("MainPhoto", () => {
	const mockProfile = {
		isMe: true,
		userService: {
			avatarUrl: "test-avatar.jpg",
		},
		onClickAvatar: jest.fn(),
		onSetAvatar: jest.fn(),
		onDeleteAvatar: jest.fn(),
	};

	beforeEach(() => {
		useProfileStore.getState().isDeleteAvatarLoading = false;
		useProfileStore.getState().setDeleteAvatarLoading = jest.fn();
		(useProfile as jest.Mock).mockReturnValue(mockProfile);
	});

	it("renders correctly", () => {
		const { container } = render(<MainPhoto />);
		expect(container).toMatchSnapshot();
	});

	it("renders avatar with correct src", () => {
		render(<MainPhoto />);
		const avatar = screen.getByTestId("image");
		expect(avatar).toHaveAttribute("src", "test-avatar.jpg");
	});

	it("shows change avatar button for own profile", () => {
		render(<MainPhoto />);
		const changeButton = screen.getByText("profile-module.change");
		expect(changeButton).toBeInTheDocument();
	});

	it("does not show change avatar button for other user's profile", () => {
		(useProfile as jest.Mock).mockReturnValue({
			...mockProfile,
			isMe: false,
		});

		render(<MainPhoto />);
		const changeButton = screen.queryByTestId("change-avatar-button");
		expect(changeButton).not.toBeInTheDocument();
	});

	it("calls onClickAvatar when avatar is clicked", () => {
		render(<MainPhoto />);
		const avatar = screen.getByTestId("image");
		fireEvent.click(avatar);
		expect(mockProfile.onClickAvatar).toHaveBeenCalled();
	});

	it("calls onDeleteAvatar when delete is triggered", () => {
		const mockOnDeleteAvatar = jest.fn();
		(useProfile as jest.Mock).mockReturnValue({
			...mockProfile,
			onDeleteAvatar: mockOnDeleteAvatar,
		});

		render(<MainPhoto />);
		const avatar = screen.getByTestId("image");
		fireEvent.contextMenu(avatar);
		expect(mockOnDeleteAvatar).not.toHaveBeenCalled();
	});
});
