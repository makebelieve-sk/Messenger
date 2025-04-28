import { render,screen } from "@testing-library/react"

import NoDataComponent from "@components/ui/no-data"

describe("No-data", () => {
    test("No-data shows correct", () => {
        render(<NoDataComponent text="Test"></NoDataComponent>)
        const dataElement = screen.getByTestId("no-data")
        expect(dataElement).toBeInTheDocument()
    })
    test("No-data has className", () => {
        render(<NoDataComponent text="Test"></NoDataComponent>)
        const dataElement = screen.getByTestId("no-data")
        expect(dataElement).toHaveClass("opacity-text no-items")
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<NoDataComponent text="Test"></NoDataComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
})