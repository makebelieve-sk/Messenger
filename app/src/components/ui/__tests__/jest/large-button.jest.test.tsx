import { screen, render } from "@testing-library/react";
import { LargeButtonComponent } from "@components/ui/button/large-button";


describe("SmallButton", () => {
    test("SmallButton with size prop", () => {
        render(<LargeButtonComponent >Test</LargeButtonComponent>);
        const boxElement = screen.getByText("Test")
        expect(boxElement)
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<LargeButtonComponent>Test</LargeButtonComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
})