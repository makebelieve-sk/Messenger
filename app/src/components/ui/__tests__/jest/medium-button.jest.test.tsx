import { screen, render } from "@testing-library/react";
import { MediumButtonComponent } from "@components/ui/button/medium-button";


describe("SmallButton", () => {
    test("SmallButton with size prop", () => {
        render(<MediumButtonComponent >Test</MediumButtonComponent>);
        const boxElement = screen.getByText("Test")
        expect(boxElement)
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<MediumButtonComponent>Test</MediumButtonComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
})