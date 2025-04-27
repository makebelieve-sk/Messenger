import { screen, render } from "@testing-library/react"
import SpinnerComponent from "@components/ui/spinner"

describe("Spinner", () => {
    test("Spinner shows correct", () => {
        render(<SpinnerComponent />)
        const spinner = screen.getByTestId("spinner")
        expect(spinner).toBeInTheDocument()
    })

    test("Spinner has className", () => {
        render(<SpinnerComponent />)
        const spinner = screen.getByTestId("spinner")
        expect(spinner).toHaveClass("spinner")
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<SpinnerComponent></SpinnerComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });

})