import { render,screen } from "@testing-library/react"

import SnackBarComponent from "@components/ui/snackbar"

describe("SnackBar", () => {
    test("SnackBar shows correct", () => {
        render(<SnackBarComponent open={true} anchor={{ vertical: "top", horizontal: "center" }}><span>Test</span></SnackBarComponent>)
        const paperElement = screen.getByText("Test")
        expect(paperElement).toBeInTheDocument()
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<SnackBarComponent open={true} anchor={{ vertical: "top", horizontal: "center" }}></SnackBarComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
})