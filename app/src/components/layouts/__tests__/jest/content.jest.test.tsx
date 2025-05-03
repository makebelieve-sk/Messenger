import { render, screen } from "@testing-library/react";

import ContentLayoutComponent from "@components/layouts/content";

describe("ContentLayoutComponent", () => {
	it("renders children inside BoxComponent", () => {
		const childrenContent = <div>Test content</div>;

		render(<ContentLayoutComponent>{childrenContent}</ContentLayoutComponent>);

		// Проверяем, что содержимое дочерних элементов отобразилось
		expect(screen.getByText("Test content")).toBeInTheDocument();
	});

	it("passes className .content to BoxComponent", () => {
		render(<ContentLayoutComponent>{<div>Test content</div>}</ContentLayoutComponent>);

		// Проверяем, что класс передается в BoxComponent
		const box = screen.getByText("Test content").parentElement;
		expect(box).toHaveClass("content");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<ContentLayoutComponent>{<div>Test content</div>}</ContentLayoutComponent>);

		// Снимаем снапшот компонента
		expect(asFragment()).toMatchSnapshot();
	});
});
