import { render, screen } from "@testing-library/react";

import CloseIconComponent from "@components/icons/closeIcon";

describe("ArrowLeftIcon", () => {
    test("renders correctly", () => {
        render(<CloseIconComponent />);
        const icon = screen.getByTestId("close-icon");
        expect(icon).toBeInTheDocument();
    });

    test("renders with custom size", () => {
        render(<CloseIconComponent size={32} />);
        const icon = screen.getByTestId("close-icon");
        expect(icon).toHaveAttribute("width", "32px");
        expect(icon).toHaveAttribute("height", "32px");
    });

    test("uses string size as is", () => {
        render(<CloseIconComponent size="2rem" />);
        const icon = screen.getByTestId("close-icon");
        expect(icon).toHaveAttribute("width", "2rem");
        expect(icon).toHaveAttribute("height", "2rem");
    });

    test("matches snapshot", () => {
        const { asFragment } = render(<CloseIconComponent></CloseIconComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});