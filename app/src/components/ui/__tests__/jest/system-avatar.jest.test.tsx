import { render, screen } from "@testing-library/react";

import SystemAvatarComponent from "@components/ui/avatar/system-avatar";

jest.mock("@components/ui/avatar", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mocked-avatar">{children}</div>
    ),
}))


describe("SystemAvatar", () => {
    test("render component with children", () => {
        const testChildren = "Test children";
        render(<SystemAvatarComponent>{testChildren}</SystemAvatarComponent>);

        const avatar = screen.getByTestId("mocked-avatar");
        expect(avatar).toHaveTextContent(testChildren);
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<SystemAvatarComponent></SystemAvatarComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
})