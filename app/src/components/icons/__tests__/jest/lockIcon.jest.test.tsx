import { render, screen } from "@testing-library/react";
import LockIconComponent from "@components/icons/lockIcon";

describe("ArrowLeftIcon", () => {
    test("renders correctly", () => {
        render(<LockIconComponent />);
        const icon = screen.getByTestId("lock-icon");
        expect(icon).toBeInTheDocument();
    });

    test("renders with custom size", () => {
        render(<LockIconComponent size={32} />);
        const icon = screen.getByTestId("lock-icon");
        expect(icon).toHaveAttribute("width", "32px");
        expect(icon).toHaveAttribute("height", "32px");
    });

    test("uses string size as is", () => {
        render(<LockIconComponent size="2rem" />);
        const icon = screen.getByTestId("lock-icon");
        expect(icon).toHaveAttribute("width", "2rem");
        expect(icon).toHaveAttribute("height", "2rem");
    });

    test("matches snapshot", () => {
        const { asFragment } = render(<LockIconComponent></LockIconComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});