import { render, screen } from "@testing-library/react";

import CheckboxComponent from "@components/ui/checkbox";

describe("CheckboxComponent", () => {
    test("should render CheckboxComponent", () => {
        render(<CheckboxComponent value={true} onChange={() => { }} />);
        const checkboxElement = screen.getByRole("checkbox");
        expect(checkboxElement).toBeInTheDocument();
    });

    test("matches snapshot", () => {
        const { asFragment } = render(<CheckboxComponent value={true} onChange={() => { }}></CheckboxComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});