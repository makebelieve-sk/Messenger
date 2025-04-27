import { screen, render } from "@testing-library/react";
import { SmallButtonComponent } from "@components/ui/button/small-button";


describe("SmallButton", () => {
    test("SmallButton with size prop", () => {
        render(<SmallButtonComponent >Test</SmallButtonComponent>);
        const boxElement = screen.getByText("Test")
        expect(boxElement)
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<SmallButtonComponent>Test</SmallButtonComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
})