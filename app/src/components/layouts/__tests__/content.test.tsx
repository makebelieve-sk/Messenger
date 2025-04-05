import { render, screen } from "@testing-library/react";
import ContentLayout from "@components/layouts/content";

describe("ContentLayout", () => {
  it("renders children inside BoxComponent", () => {
    const childrenContent = <div>Test content</div>;

    render(<ContentLayout>{childrenContent}</ContentLayout>);

    // Проверяем, что содержимое дочерних элементов отобразилось
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("passes className .content to BoxComponent", () => {
    render(<ContentLayout>{<div>Test content</div>}</ContentLayout>);

    // Проверяем, что класс передается в BoxComponent
    const box = screen.getByText("Test content").parentElement;
    expect(box).toHaveClass("content");
  });

  it("matches snapshot", () => {
    const { asFragment } = render(<ContentLayout>{<div>Test content</div>}</ContentLayout>);

    // Снимаем снапшот компонента
    expect(asFragment()).toMatchSnapshot();
  });
});
