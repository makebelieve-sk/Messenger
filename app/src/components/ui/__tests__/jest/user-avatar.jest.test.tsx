import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserAvatarComponent from "@components/ui/avatar/user-avatar";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => jest.fn()
}));

jest.mock("@components/ui/avatar", () => ({
    __esModule: true,
    default: ({ src, alt, className, ...props }) => (
        <img
            data-testid="mocked-avatar"
            src={src}
            alt={alt}
            className={className}
            {...props}
        />
    ),
}));

describe("UserAvatarComponent", () => {
    test("render component with props", () => {
        render(
            <MemoryRouter>
                <UserAvatarComponent src="fakeUrl" alt="fakeAlt" />
            </MemoryRouter>
        );

        const avatar = screen.getByTestId("mocked-avatar");
        expect(avatar).toHaveAttribute("src", "fakeUrl");
        expect(avatar).toHaveAttribute("alt", "fakeAlt");
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<UserAvatarComponent></UserAvatarComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
})
