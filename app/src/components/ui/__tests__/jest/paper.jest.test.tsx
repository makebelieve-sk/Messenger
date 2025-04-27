import { screen, render } from "@testing-library/react"
import PaperComponent from "@components/ui/paper"

describe("Paper", () => {
    test("Paper shows correct", () => {
        render(<PaperComponent>Test</PaperComponent>)
        const paperElement = screen.getByText("Test")
        expect(paperElement).toBeInTheDocument()
    })
    test("Paper has className", () => {
        render(<PaperComponent>Test</PaperComponent>)
        const paperElement = screen.getByText("Test")
        expect(paperElement).toHaveClass("MuiPaper-root")
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<PaperComponent>Test</PaperComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
})