import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import HeaderComponent from "@components/layouts/header";
import { AVATAR_URL } from "@utils/files";
import { BASE_URL } from "@utils/constants";
import { UserEvents } from "@custom-types/events";
import React from "react";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

const mockLogout = jest.fn().mockResolvedValue(true);

jest.mock("@hooks/useMainClient", () => ({
    __esModule: true,
    default: () => ({
        mainApi: {
            logout: mockLogout,
        },
    }),
}));

jest.mock("@components/ui/avatar/user-avatar", () => {
    return {
        __esModule: true,
        default: ({ src, alt, onClick, "data-testid": dataTestId, ...props }) => (
            <img
                src={src}
                alt={alt}
                onClick={onClick}
                data-testid={dataTestId}
                {...props}
            />
        )
    };
});

jest.mock("@components/ui/menu-item", () => ({
    __esModule: true,
    default: ({ children, onClick, "data-testid": dataTestId, ...props }) => (
        <div onClick={onClick} data-testid={dataTestId} {...props}>{children}</div>
    )
}));

jest.mock("@components/ui/menu", () => {
    return {
        __esModule: true,
        default: ({ children, open, onClose, ...props }) => {
            if (!open) return null;

            return (
                <div role="menu" {...props}>
                    {children}
                    <button onClick={onClose} data-testid="close-menu-button">Close</button>
                </div>
            );
        }
    };
});

describe("HeaderComponent", () => {
    const mockNavigate = jest.fn();
    beforeAll(() => {
        // Мокаем useNavigate
        const reactRouterDom = require("react-router-dom");
        reactRouterDom.useNavigate.mockReturnValue(mockNavigate);
    })


    afterEach(() => {
        jest.clearAllMocks();
    });

    test("All text in components", () => {
        render(
            <MemoryRouter>
                <HeaderComponent />
            </MemoryRouter>
        );

        const avatarButton = screen.getByTestId("avatar-img");
        fireEvent.click(avatarButton);

        const settings = screen.getByText("Settings");
        const help = screen.getByText("Help");
        const logout = screen.getByText("Log Out");

        expect(settings).toBeInTheDocument();
        expect(help).toBeInTheDocument();
        expect(logout).toBeInTheDocument();
    })

    test("обновляет аватар если приходит AVATAR_URL", () => {
        const mockUseProfile = jest.spyOn(require("@hooks/useProfile"), "default");

        let onChangeFieldCallback: (field: string) => void = () => { };

        mockUseProfile.mockReturnValue({
            user: {
                avatarUrl: "fakeUrl",
            },
            on: (_event: string, callback: (field: string) => void) => {
                if (_event === UserEvents.CHANGE_FIELD) {
                    onChangeFieldCallback = callback;
                }
            },
            off: jest.fn(),
        });

        render(
            <MemoryRouter>
                <HeaderComponent />
            </MemoryRouter>
        );

        // Вызываем событие изменения поля
        onChangeFieldCallback(AVATAR_URL);

        // Проверяем, что UserAvatarComponent получил новый src
        expect(screen.getByTestId("avatar-img")).toHaveAttribute("src", "fakeUrl");
    })

    test("goTo", () => {
        render(
            <MemoryRouter>
                <HeaderComponent />
            </MemoryRouter>
        );

        const avatarButton = screen.getByTestId("avatar-img");
        fireEvent.click(avatarButton);

        const settingsButton = screen.getByTestId("menu-settings");
        fireEvent.click(settingsButton);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/settings");

        fireEvent.click(avatarButton);
        const helpButton = screen.getByTestId("menu-help");
        fireEvent.click(helpButton);
        expect(mockNavigate).toHaveBeenCalledTimes(2);
        expect(mockNavigate).toHaveBeenCalledWith("/help");

    });

    test("logout", async () => {
        render(
            <MemoryRouter>
                <HeaderComponent />
            </MemoryRouter>
        );

        const avatarButton = screen.getByTestId("avatar-img");
        fireEvent.click(avatarButton);

        const logoutButton = screen.getByTestId("menu-logout");
        fireEvent.click(logoutButton);

        await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
    })

    test("onMouseDown", () => {
        const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

        render(
            <MemoryRouter>
                <HeaderComponent />
            </MemoryRouter>
        );

        const profileButton = screen.getByTestId("menu-profile");
        fireEvent.click(profileButton); expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/profile");

        fireEvent.mouseDown(profileButton, { button: 1 });
        expect(openSpy).toHaveBeenCalledWith(BASE_URL);

        openSpy.mockRestore();
    })

    test("click to open menu", () => {
        render(
            <MemoryRouter>
                <HeaderComponent />
            </MemoryRouter>
        );

        const avatatButton = screen.getByTestId("avatar-img");
        fireEvent.click(avatatButton);
        expect(screen.getByRole("menu")).toBeInTheDocument();
    })

    test("close menu", async () => {
        render(
            <MemoryRouter>
                <HeaderComponent />
            </MemoryRouter>
        );

        const avatatButton = screen.getByTestId("avatar-img");
        fireEvent.click(avatatButton);

        const menu = screen.getByRole("menu");
        expect(menu).toBeInTheDocument();
        expect(menu).toBeVisible();

        const closeButton = screen.getByTestId("close-menu-button");
        fireEvent.click(closeButton);


        await waitFor(() => {
            expect(menu).not.toBeInTheDocument();
        });
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<HeaderComponent></HeaderComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
})