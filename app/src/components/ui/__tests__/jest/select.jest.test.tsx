import { render,screen } from "@testing-library/react"

import SelectComponent from "@components/ui/select"

jest.mock("@mui/material/Select", () => {
    return {
        __esModule: true,
        default: ({ children, className }) => (
            <div className={className}>{children}</div>
        )
    };
});

jest.mock("@mui/material/InputLabel", () => {
    return {
        __esModule: true,
        default: ({ children, className }) => (
            <label className={className}>{children}</label>
        )
    };
});

describe("Select", () => {
    test("SnackBar shows correct", () => {
        render(<SelectComponent value="test">Test</SelectComponent>)
        const selectElement = screen.getByTestId("select")
        expect(selectElement).toBeInTheDocument()
    })

    test("Select has className", () => {
        render(<SelectComponent value="test" onChange={() => { }}>Test</SelectComponent>)
        const selectElement = screen.getByTestId("select")
        expect(selectElement).toHaveClass("select")
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<SelectComponent>Test</SelectComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
})