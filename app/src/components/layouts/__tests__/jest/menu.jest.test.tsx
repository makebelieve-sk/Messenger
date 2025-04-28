import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { fireEvent,render, screen } from "@testing-library/react";

import MenuComponent from "@components/layouts/menu";
import { mockUseAppDispatch,mockUseAppSelector } from "../../../../__mocks__/@hooks/useGlobalState";
import { mockStore } from "../../../../__mocks__/store";

jest.mock("@hooks/useGlobalState");

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

jest.mock("@hooks/useMainClient", () => ({
    __esModule: true,
    default: () => ({
        mainApi: {
            getFriendsNotification: jest.fn(),
            getMessageNotification: jest.fn(),
        },
    }),
}));

jest.mock("@components/ui/menu-item", () => {
    return {
        __esModule: true,
        default: ({ children, onClick, className, "data-testid": dataTestId, ...props }) => (
            <div
                onClick={onClick}
                className={className}
                data-testid={dataTestId}
                {...props}
            >
                {children}
            </div>
        )
    };
});

describe("MenuComponent", () => {
    const mockNavigate = jest.fn();
    beforeAll(() => {
        // Мокаем useNavigate
        const reactRouterDom = require("react-router-dom");
        reactRouterDom.useNavigate.mockReturnValue(mockNavigate);

        mockUseAppSelector.mockImplementation((selector: any) => {
            if (selector.name === "selectMainState") {
                return { friendNotification: 2, messageNotification: 1 };
            }
            return { unRead: 5 };
        });

        mockUseAppDispatch.mockReturnValue(jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    test("All text in components", () => {
        render(
            <Provider store={mockStore}>
                <MemoryRouter>
                    <MenuComponent />
                </MemoryRouter>
            </Provider>
        );
        const profile = screen.getByText("My profile");
        const messanger = screen.getByText("Messenger");
        const friend = screen.getByText("Friends");
        const developers = screen.getByText("To developers");

        expect(profile).toBeInTheDocument();
        expect(messanger).toBeInTheDocument();
        expect(friend).toBeInTheDocument();
        expect(developers).toBeInTheDocument();
    })

    test("All navigate is clicked", () => {
        render(
            <Provider store={mockStore}>
                <MemoryRouter>
                    <MenuComponent />
                </MemoryRouter>
            </Provider>
        );

        const profileButton = screen.getByTestId("menu-profile");
        const messangerButton = screen.getByTestId("menu-messenger");
        const friendButton = screen.getByTestId("menu-friends");

        fireEvent.click(profileButton);
        fireEvent.click(messangerButton);
        fireEvent.click(friendButton);

        expect(mockNavigate).toHaveBeenCalledTimes(3);
        expect(mockNavigate).toHaveBeenCalledWith("/profile");
        expect(mockNavigate).toHaveBeenCalledWith("/messages");
        expect(mockNavigate).toHaveBeenCalledWith("/friends");
    })

    test("All bages show smth", () => {
        render(
            <Provider store={mockStore}>
                <MemoryRouter>
                    <MenuComponent />
                </MemoryRouter>
            </Provider>
        );

        // const messageBadge = screen.getByTestId("menu-messenger").querySelector(".menu__list__item__badge");
        // expect(messageBadge).toBeInTheDocument();
        // expect(messageBadge).toHaveTextContent("1");

        const friendBadge = screen.getByTestId("menu-friends").querySelector(".menu__list__item__badge");
        expect(friendBadge).toBeInTheDocument();
        expect(friendBadge).toHaveTextContent("2");

    })

    test("All bages not show smth", () => {
        mockUseAppSelector.mockImplementation((selector: any) => {
            if (selector.name === "selectMainState") {
                return { friendNotification: null, messageNotification: null };
            }
            return { unRead: 0 };
        });

        render(
            <Provider store={mockStore}>
                <MemoryRouter>
                    <MenuComponent />
                </MemoryRouter>
            </Provider>
        );

        const messageBadge = screen.getByTestId("menu-messenger").querySelector(".menu__list__item__badge");
        expect(messageBadge).toBeInTheDocument();
        expect(messageBadge).toHaveTextContent("");

        const friendBadge = screen.getByTestId("menu-friends").querySelector(".menu__list__item__badge");
        expect(friendBadge).toBeInTheDocument();
        expect(friendBadge).toHaveTextContent("");
    })

    test("matches snapshot", () => {
        const { asFragment } = render(<MenuComponent></MenuComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});