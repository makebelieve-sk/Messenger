import { render, screen } from "@testing-library/react";

import GridComponent from "@components/ui/grid";

describe("GridComponent", () => {
    test("should render GridComponent", () => {
        render(<GridComponent><div>Test</div></GridComponent>);
        const gridElement = screen.getByText("Test");
        expect(gridElement).toBeInTheDocument();
    });

    test("matches snapshot", () => {
        const { asFragment } = render(<GridComponent></GridComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});