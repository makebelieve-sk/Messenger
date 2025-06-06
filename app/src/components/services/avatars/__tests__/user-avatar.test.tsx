import { render } from "@testing-library/react";

import UserAvatarComponent from "@components/services/avatars/user-avatar";

describe("UserAvatarComponent", () => {
	it("should render correctly with all props", () => {
		const props = {
			userId: "123",
			src: "https://example.com/avatar.jpg",
			alt: "User Avatar",
			id: "custom-id",
			className: "custom-class",
		};

		const { container } = render(<UserAvatarComponent {...props} />);
		expect(container).toMatchSnapshot();
	});

	it("should render correctly with minimal props", () => {
		const props = {
			userId: "456",
			src: "https://example.com/avatar.jpg",
			alt: "User Avatar",
		};

		const { container } = render(<UserAvatarComponent {...props} />);
		expect(container).toMatchSnapshot();
	});

	it("should render correctly with null src", () => {
		const props = {
			userId: "789",
			src: null,
			alt: "User Avatar",
		};

		const { container } = render(<UserAvatarComponent {...props} />);
		expect(container).toMatchSnapshot();
	});

	it("should render correctly with empty className", () => {
		const props = {
			userId: "101",
			src: "https://example.com/avatar.jpg",
			alt: "User Avatar",
			className: "",
		};

		const { container } = render(<UserAvatarComponent {...props} />);
		expect(container).toMatchSnapshot();
	});
});
