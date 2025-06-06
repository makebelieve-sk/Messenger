import { render } from "@testing-library/react";

import SystemAvatarComponent from "@components/services/avatars/system-avatar";

describe("SystemAvatarComponent", () => {
	it("should render correctly with children", () => {
		const props = {
			children: <span>Test Icon</span>,
		};

		const { container } = render(<SystemAvatarComponent {...props} />);
		expect(container).toMatchSnapshot();
	});

	it("should render correctly with custom className", () => {
		const props = {
			children: <span>Test Icon</span>,
			className: "custom-class",
		};

		const { container } = render(<SystemAvatarComponent {...props} />);
		expect(container).toMatchSnapshot();
	});

	it("should render correctly with empty className", () => {
		const props = {
			children: <span>Test Icon</span>,
			className: "",
		};

		const { container } = render(<SystemAvatarComponent {...props} />);
		expect(container).toMatchSnapshot();
	});
});
