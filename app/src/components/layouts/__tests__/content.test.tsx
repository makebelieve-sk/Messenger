import { render, screen } from "@testing-library/react";

import ContentComponent from "@components/layouts/content";

describe("ContentComponent", () => {
	const renderComponent = (children: React.ReactNode = "Test Content") => {
		return render(<ContentComponent>{children}</ContentComponent>);
	};

	it("renders content with correct test id", () => {
		renderComponent();
		expect(screen.getByTestId("box-component")).toBeInTheDocument();
	});

	it("renders content with correct className", () => {
		renderComponent();
		const content = screen.getByTestId("box-component");
		expect(content).toHaveClass("main-content");
	});

	it("renders children content correctly", () => {
		const testContent = "Test Child Content";
		renderComponent(testContent);
		expect(screen.getByText(testContent)).toBeInTheDocument();
	});

	it("renders complex children content correctly", () => {
		const complexContent = (
			<div data-testid="complex-child">
				<h1>Title</h1>
				<p>Paragraph</p>
			</div>
		);
		renderComponent(complexContent);
		expect(screen.getByTestId("complex-child")).toBeInTheDocument();
		expect(screen.getByText("Title")).toBeInTheDocument();
		expect(screen.getByText("Paragraph")).toBeInTheDocument();
	});

	it("renders empty content without errors", () => {
		renderComponent(null);
		expect(screen.getByTestId("box-component")).toBeInTheDocument();
	});

	it("matches snapshot with default content", () => {
		const { container } = renderComponent();
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with complex content", () => {
		const complexContent = (
			<div data-testid="complex-child">
				<h1>Title</h1>
				<p>Paragraph</p>
			</div>
		);
		const { container } = renderComponent(complexContent);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with empty content", () => {
		const { container } = renderComponent(null);
		expect(container).toMatchSnapshot();
	});
});
