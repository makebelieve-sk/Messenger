import { render, screen } from "@testing-library/react";

import FriendsBlock from "@modules/profile/top-friends/friends-block";
import { IUser } from "@custom-types/models.types";

const mockUsers: IUser[] = [
	{
		id: "1",
		firstName: "John",
		secondName: "Doe",
		thirdName: "Smith",
		email: "john@example.com",
		phone: "1234567890",
		avatarUrl: "avatar1.jpg",
		avatarCreateDate: "2024-01-01",
		fullName: "John Doe Smith",
	},
	{
		id: "2",
		firstName: "Jane",
		secondName: "Smith",
		thirdName: "Doe",
		email: "jane@example.com",
		phone: "0987654321",
		avatarUrl: "avatar2.jpg",
		avatarCreateDate: "2024-01-02",
		fullName: "Jane Smith Doe",
	},
];

describe("FriendsBlock", () => {
	it("renders with title and count", () => {
		const { container } = render(
			<FriendsBlock
				state={{
					title: "Friends",
					count: 2,
					users: mockUsers,
				}}
				onClickBlock={() => {}}
			>
				<div>No friends</div>
			</FriendsBlock>,
		);
		expect(container).toMatchSnapshot();
		expect(screen.getByText("Friends")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
	});

	it("renders loading state", () => {
		const { container } = render(
			<FriendsBlock
				state={{
					title: "Friends",
					count: 2,
					users: mockUsers,
				}}
				isLoading={true}
				onClickBlock={() => {}}
			>
				<div>No friends</div>
			</FriendsBlock>,
		);
		expect(container).toMatchSnapshot();
		expect(screen.getByRole("progressbar")).toBeInTheDocument();
	});

	it("renders users list when users are provided", () => {
		const { container } = render(
			<FriendsBlock
				state={{
					title: "Friends",
					count: 2,
					users: mockUsers,
				}}
				onClickBlock={() => {}}
			>
				<div>No friends</div>
			</FriendsBlock>,
		);
		expect(container).toMatchSnapshot();
		expect(screen.getByText("John")).toBeInTheDocument();
		expect(screen.getByText("Jane")).toBeInTheDocument();
	});

	it("renders children when no users are provided", () => {
		const { container } = render(
			<FriendsBlock
				state={{
					title: "Friends",
					count: 0,
					users: [],
				}}
				onClickBlock={() => {}}
			>
				<div>No friends</div>
			</FriendsBlock>,
		);
		expect(container).toMatchSnapshot();
		expect(screen.getByText("No friends")).toBeInTheDocument();
	});

	it("calls onClickBlock when title is clicked", () => {
		const handleClick = jest.fn();
		const { container } = render(
			<FriendsBlock
				state={{
					title: "Friends",
					count: 2,
					users: mockUsers,
				}}
				onClickBlock={handleClick}
			>
				<div>No friends</div>
			</FriendsBlock>,
		);
		expect(container).toMatchSnapshot();
		screen.getByText("Friends").click();
		expect(handleClick).toHaveBeenCalled();
	});
});
