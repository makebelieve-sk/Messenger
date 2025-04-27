import { render, screen } from "@testing-library/react";
import Router from "@components/main/Router";
import { MemoryRouter } from "react-router-dom";
import { Pages } from "@custom-types/enums";

// Мок для хука useMainClient
const mockOn = jest.fn();
const mockOff = jest.fn();
jest.mock("@hooks/useMainClient", () => () => ({
    on: mockOn,
    off: mockOff
}));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

jest.mock("@store/main/slice", () => ({
    selectMainState: jest.fn(),
}));

jest.mock("@hooks/useGlobalState", () => ({
    useAppSelector: jest.fn(),
}));

jest.mock("@pages/Profile", () => () => <div data-testid="profile">Profile Page</div>);
jest.mock("@pages/SignIn", () => () => <div data-testid="sign-in">Sign In Page</div>);
jest.mock("@pages/SignUp", () => () => <div data-testid="sign-up">Sign Up Page</div>);
jest.mock("@pages/Edit", () => () => <div data-testid="edit">Edit Page</div>);


describe("Router", () => {
    const mockNavigate = jest.fn();
    beforeAll(() => {
        // Мокаем useNavigate
        const reactRouterDom = require("react-router-dom");
        reactRouterDom.useNavigate.mockReturnValue(mockNavigate);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders authenticated routes when user is authenticated", () => {
        // Настраиваем мок для useAppSelector, чтобы вернуть isAuth: true
        const { useAppSelector } = require("@hooks/useGlobalState");
        useAppSelector.mockReturnValue({ isAuth: true });

        render(
            <MemoryRouter initialEntries={[Pages.profile]}>
                <Router />
            </MemoryRouter>
        );

        // Проверяем, что отображается страница профиля
        expect(screen.getByTestId("profile")).toBeInTheDocument();

        // Проверяем, что хук useMainClient.on был вызван
        expect(mockOn).toHaveBeenCalled();
    });

    test("renders unauthenticated routes when user is not authenticated", () => {
        // Настраиваем мок для useAppSelector, чтобы вернуть isAuth: false
        const { useAppSelector } = require("@hooks/useGlobalState");
        useAppSelector.mockReturnValue({ isAuth: false });

        render(
            <MemoryRouter initialEntries={[Pages.signIn]}>
                <Router />
            </MemoryRouter>
        );

        // Проверяем, что отображается страница входа
        expect(screen.getByTestId("sign-in")).toBeInTheDocument();
    });

    test("redirects to profile page when accessing non-existent route while authenticated", () => {
        // Настраиваем мок для useAppSelector, чтобы вернуть isAuth: true
        const { useAppSelector } = require("@hooks/useGlobalState");
        useAppSelector.mockReturnValue({ isAuth: true });

        render(
            <MemoryRouter initialEntries={["/non-existent-route"]}>
                <Router />
            </MemoryRouter>
        );

        // Проверяем, что отображается страница профиля (редирект)
        expect(screen.getByTestId("profile")).toBeInTheDocument();
    });

    test("redirects to sign-in page when accessing non-existent route while not authenticated", () => {
        // Настраиваем мок для useAppSelector, чтобы вернуть isAuth: false
        const { useAppSelector } = require("@hooks/useGlobalState");
        useAppSelector.mockReturnValue({ isAuth: false });

        render(
            <MemoryRouter initialEntries={["/non-existent-route"]}>
                <Router />
            </MemoryRouter>
        );

        // Проверяем, что отображается страница входа (редирект)
        expect(screen.getByTestId("sign-in")).toBeInTheDocument();
    });

    test("calls navigate when onRedirect is triggered", () => {
        // Настраиваем мок для useAppSelector
        const { useAppSelector } = require("@hooks/useGlobalState");
        useAppSelector.mockReturnValue({ isAuth: true });

        render(
            <MemoryRouter>
                <Router />
            </MemoryRouter>
        );

        // Получаем onRedirect функцию, которая была передана в mainClient.on
        const onRedirectFunction = mockOn.mock.calls[0][1];

        // Вызываем эту функцию с тестовым путем
        onRedirectFunction("/test-path");

        // Проверяем, что navigate был вызван с правильным путем
        expect(mockNavigate).toHaveBeenCalledWith("/test-path");
    });

    test("unsubscribes from events on unmount", () => {
        // Настраиваем мок для useAppSelector
        const { useAppSelector } = require("@hooks/useGlobalState");
        useAppSelector.mockReturnValue({ isAuth: true });

        const { unmount } = render(
            <MemoryRouter>
                <Router />
            </MemoryRouter>
        );

        // Размонтируем компонент
        unmount();

        // Проверяем, что mainClient.off был вызван
        expect(mockOff).toHaveBeenCalled();
    });

    test("matches snapshot", () => {
        const { asFragment } = render(
            <MemoryRouter>
                <Router />
            </MemoryRouter>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});