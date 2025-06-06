import { render } from "@testing-library/react";

import BigUserUserAvatar from "@components/services/avatars/big-user-avatar";

describe("BigUserUserAvatar", () => {
	it("should render correctly with all props", () => {
		const props = {
			userId: "123",
			src: "https://example.com/avatar.jpg",
			alt: "User Avatar",
		};

		const { container } = render(<BigUserUserAvatar {...props} />);
		expect(container).toMatchSnapshot();
	});

	it("should render correctly with different props", () => {
		const props = {
			userId: "456",
			src: "https://example.com/different-avatar.jpg",
			alt: "Different User Avatar",
		};

		const { container } = render(<BigUserUserAvatar {...props} />);
		expect(container).toMatchSnapshot();
	});

	it("should render correctly with empty alt text", () => {
		const props = {
			userId: "789",
			src: "https://example.com/avatar.jpg",
			alt: "",
		};

		const { container } = render(<BigUserUserAvatar {...props} />);
		expect(container).toMatchSnapshot();
	});
});
