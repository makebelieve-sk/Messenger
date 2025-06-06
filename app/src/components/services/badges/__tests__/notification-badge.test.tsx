import { render, screen } from "@testing-library/react";

import NotificationBadge from "@components/services/badges/notification-badge";

describe("NotificationBadge", () => {
	it("renders without content", () => {
		render(<NotificationBadge content={undefined} />);
		const badge = screen.getByTestId("notification-badge");
		expect(badge).toBeInTheDocument();
	});

	it("renders with string content", () => {
		render(<NotificationBadge content="5" />);
		const badge = screen.getByText("5");
		expect(badge).toBeInTheDocument();
	});

	it("renders with number content", () => {
		render(<NotificationBadge content="10" />);
		const badge = screen.getByText("10");
		expect(badge).toBeInTheDocument();
	});

	it("applies custom className", () => {
		render(<NotificationBadge content="3" className="custom-class" />);
		const badge = screen.getByTestId("notification-badge");
		expect(badge).toHaveClass("notification-badge custom-class");
	});

	it("renders with default content value", () => {
		render(<NotificationBadge content={undefined} />);
		const badge = screen.getByTestId("notification-badge");
		expect(badge).toBeInTheDocument();
	});

	it("passes additional props to Badge component", () => {
		const id = "custom-id";
		const { container } = render(<NotificationBadge content="1" id={id} />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with null content", () => {
		const { container } = render(<NotificationBadge content={undefined} />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with string content", () => {
		const { container } = render(<NotificationBadge content="5" />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with number content", () => {
		const { container } = render(<NotificationBadge content="10" />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with custom className", () => {
		const { container } = render(<NotificationBadge content="3" className="custom-class" />);
		expect(container).toMatchSnapshot();
	});
});
