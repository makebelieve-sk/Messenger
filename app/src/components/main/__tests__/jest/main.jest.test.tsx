import { render, screen } from "@testing-library/react";

import Main from "@components/main/Main";

jest.mock("@core/MainClient", () => {
    return jest.fn().mockImplementation(() => {
        return {
            init: jest.fn(),
        };
    });
});

jest.mock("@hooks/useGlobalState", () => ({
    useAppDispatch: () => jest.fn()
}));

jest.mock("@components/main/app", () => ({
    __esModule: true,
    default: () => <div data-testid="app">App Component</div>,
}));


describe("Main", () => {
    test("renders correct", () => {
        render(<Main />);
        const appElement = screen.getByTestId("app");
        expect(appElement).toBeInTheDocument();
    });

    test("matches snapshot", () => {
        const { asFragment } = render(<Main></Main>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});