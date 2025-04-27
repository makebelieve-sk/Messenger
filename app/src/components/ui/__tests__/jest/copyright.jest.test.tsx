import { render, screen } from "@testing-library/react"
import CopyrightComponent from "@components/ui/copyright";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

describe("Copyright", () => {
    const mockNavigate = jest.fn();

    beforeAll(() => {
        // Мокаем useNavigate
        const reactRouterDom = require("react-router-dom");
        reactRouterDom.useNavigate.mockReturnValue(mockNavigate);
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should render CopyrightComponent", () => {
        render(
            <MemoryRouter>
                <CopyrightComponent />
            </MemoryRouter>
        );
        const copyrightElement = screen.getByTestId("copyright");
        expect(copyrightElement).toBeInTheDocument();
    });

    test("Copyright click", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <CopyrightComponent />
            </MemoryRouter>
        );
        const copyrightElement = screen.getByRole("link");
        await user.click(copyrightElement);
        expect(mockNavigate).toHaveBeenCalledWith("/about-us");
    });

    test("matches snapshot", () => {
        const { asFragment } = render(<CopyrightComponent></CopyrightComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});