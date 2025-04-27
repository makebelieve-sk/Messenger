import { render, screen } from "@testing-library/react";
import ArrowLeftIconComponent from "@components/icons/arrowLeftIcon";

describe("ArrowLeftIcon", () => {
    test("renders correctly", () => {
        render(<ArrowLeftIconComponent />);
        const icon = screen.getByTestId("arrow-left-icon");
        expect(icon).toBeInTheDocument();
    });

    test("renders with custom size", () => {
        render(<ArrowLeftIconComponent size={32} />);
        const icon = screen.getByTestId("arrow-left-icon");
        expect(icon).toHaveAttribute("width", "32px");
        expect(icon).toHaveAttribute("height", "32px");
    });

    test("uses string size as is", () => {
        render(<ArrowLeftIconComponent size="2rem" />);
        const icon = screen.getByTestId("arrow-left-icon");
        expect(icon).toHaveAttribute("width", "2rem");
        expect(icon).toHaveAttribute("height", "2rem");
    });

    test("matches snapshot", () => {
        const { asFragment } = render(<ArrowLeftIconComponent></ArrowLeftIconComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});