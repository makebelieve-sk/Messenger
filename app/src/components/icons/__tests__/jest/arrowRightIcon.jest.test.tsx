import { render, screen } from "@testing-library/react";

import ArrowRightIconComponent from "@components/icons/arrowRightIcon";

describe("ArrowLeftIcon", () => {
    test("renders correctly", () => {
        render(<ArrowRightIconComponent />);
        const icon = screen.getByTestId("arrow-right-icon");
        expect(icon).toBeInTheDocument();
    });

    test("renders with custom size", () => {
        render(<ArrowRightIconComponent size={32} />);
        const icon = screen.getByTestId("arrow-right-icon");
        expect(icon).toHaveAttribute("width", "32px");
        expect(icon).toHaveAttribute("height", "32px");
    });

    test("uses string size as is", () => {
        render(<ArrowRightIconComponent size="2rem" />);
        const icon = screen.getByTestId("arrow-right-icon");
        expect(icon).toHaveAttribute("width", "2rem");
        expect(icon).toHaveAttribute("height", "2rem");
    });

    test("matches snapshot", () => {
        const { asFragment } = render(<ArrowRightIconComponent></ArrowRightIconComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});