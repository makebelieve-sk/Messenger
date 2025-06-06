import { fireEvent, render, screen } from "@testing-library/react";

import ChooseAvatar from "@modules/sign-up/ChooseAvatar";
import useAuthStore from "@store/auth";
import { AVATAR_URL } from "@utils/constants";

jest.mock("@store/auth", () => {
	const mockStore = {
		chooseAvatarLoading: false,
		setChooseAvatarLoading: jest.fn(),
	};
  
	return {
		__esModule: true,
		default: jest.fn((selector) => selector(mockStore)),
		getState: () => mockStore,
	};
});

jest.mock("@service/i18n", () => ({
	t: (key: string) => key,
}));

describe("ChooseAvatar", () => {
	const mockOnChange = jest.fn();
	const mockOnChangeAvatar = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders with username and generates avatar letters", () => {
		const { container } = render(
			<ChooseAvatar
				username="John Doe"
				avatarUrl=""
				onChange={mockOnChange}
				onChangeAvatar={mockOnChangeAvatar}
			/>,
		);
		expect(container).toMatchSnapshot();
		expect(screen.getByText("John Doe, profile-module.how_like_avatar")).toBeInTheDocument();
		expect(screen.getByText("JD")).toBeInTheDocument();
	});

	it("displays avatar image when avatarUrl is provided", () => {
		const { container } = render(
			<ChooseAvatar
				username="John Doe"
				avatarUrl="test-url"
				onChange={mockOnChange}
				onChangeAvatar={mockOnChangeAvatar}
			/>,
		);
		expect(container).toMatchSnapshot();
		const avatarImage = screen.getByAltText("user-avatar");
		expect(avatarImage).toBeInTheDocument();
		expect(avatarImage).toHaveAttribute("src", "test-url");
	});

	it("shows loading spinner when loading is true", () => {
		const mockStore = {
			chooseAvatarLoading: true,
			setChooseAvatarLoading: jest.fn(),
		};
		(useAuthStore as unknown as jest.Mock).mockImplementation((selector) => selector(mockStore));

		const { container } = render(
			<ChooseAvatar
				username="John Doe"
				avatarUrl=""
				onChange={mockOnChange}
				onChangeAvatar={mockOnChangeAvatar}
			/>,
		);
		expect(container).toMatchSnapshot();
		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});

	it("calls onChange with empty string when deleteAvatar is called", () => {
		const { container } = render(
			<ChooseAvatar
				username="John Doe"
				avatarUrl="test-url"
				onChange={mockOnChange}
				onChangeAvatar={mockOnChangeAvatar}
			/>,
		);
		expect(container).toMatchSnapshot();
	});

	it("calls onChangeAvatar when changeAvatar is called", () => {
		const { container } = render(
			<ChooseAvatar
				username="John Doe"
				avatarUrl=""
				onChange={mockOnChange}
				onChangeAvatar={mockOnChangeAvatar}
			/>,
		);
		expect(container).toMatchSnapshot();

		const file = new File([ "test" ], "test.jpg", { type: "image/jpeg" });
		const input = screen.getByTestId("input-image");

		const event = {
			target: {
				files: [ file ],
			},
		};

		fireEvent.change(input, event);

		expect(mockOnChangeAvatar).not.toHaveBeenCalledWith(AVATAR_URL, {
			file,
			preview: expect.any(String),
		});
	});
});
