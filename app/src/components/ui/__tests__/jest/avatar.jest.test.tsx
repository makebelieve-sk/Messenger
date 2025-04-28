import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import Avatar from "@components/ui/avatar";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));
jest.mock("@hooks/useImage", () => ({
    __esModule: true,
    default: jest.fn(() => "https://example.com/avatar.jpg"),
}));

describe("AvatarComponent", () => {
    const mockNavigate = jest.fn();
    beforeAll(() => {
        // Мокаем useNavigate
        const reactRouterDom = require("react-router-dom");
        reactRouterDom.useNavigate.mockReturnValue(mockNavigate);
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("renders avatar with src", () => {
        render(<Avatar src="https://example.com/avatar.jpg" alt="Avatar" />);
        const avatarElement = screen.getByAltText("Avatar");
        expect(avatarElement).toBeInTheDocument();
    });

    test("renders avatar without src", () => {
        render(<Avatar alt="Avatar" />);
        const avatarElement = screen.getByAltText("Avatar");
        expect(avatarElement).toBeInTheDocument();
    });

    test("Clicked", () => {
        render(
            <MemoryRouter>
                <Avatar />
            </MemoryRouter>
        );

        const avatarMui = screen.getByTestId("avatar");

        fireEvent.click(avatarMui);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/profile");
    })

    test("renders avatar with src and alt", () => {
        render(<Avatar src="https://example.com/avatar.jpg" alt="Avatar" />);
        const avatarElement = screen.getByAltText("Avatar");
        expect(avatarElement).toBeInTheDocument();
    });

    test("renders avatar with children", () => {
        render(<Avatar>A</Avatar>);
        const avatarElement = screen.getByText("A");
        expect(avatarElement).toBeInTheDocument();
    });

    test("render Avatar with isOnline", () => {
        render(<Avatar isOnline />);
        const avatarElement = screen.getByTestId("avatar");
        expect(avatarElement).toBeInTheDocument();
    });

      test("matches snapshot", () => {
        const { asFragment } = render(<Avatar></Avatar>);
    
        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
      });
});