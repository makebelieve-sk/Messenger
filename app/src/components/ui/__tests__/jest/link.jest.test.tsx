import { render,screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LinkComponent from "@components/ui/link";

describe("LinkComponent", () => {
    it("LinkComponent shows correct", () => {
        render(<LinkComponent>Link</LinkComponent>);
        const linkElement = screen.getByTestId("link");
        expect(linkElement).toBeInTheDocument();
    });

    test("LinkComponent click with userEvent", async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();
        render(<LinkComponent onClick={onClick}>Link</LinkComponent>);
        const linkElement = screen.getByTestId("link");
        await user.click(linkElement);
        expect(onClick).toHaveBeenCalled();
    });

    test("matches snapshot", () => {
        const { asFragment } = render(<LinkComponent></LinkComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});