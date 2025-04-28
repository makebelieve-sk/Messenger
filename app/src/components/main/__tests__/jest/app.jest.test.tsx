import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import App from "@components/main/app";
import { mockUseAppSelector } from "../../../../__mocks__/@hooks/useGlobalState";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("@components/services/modals/ModalWithAttachments", () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-modal-attachments">Mocked Modal With Attachments</div>,
}));

jest.mock("@components/layouts/header", () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-header">Mocked Header</div>,
}));

jest.mock("@components/layouts/menu", () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-menu">Mocked Menu</div>,
}));

jest.mock("@components/main/ServiceComponents", () => ({
  __esModule: true,
  default: () => <div >Mocked ServiceComponents</div>,
}));

jest.mock("@components/main/Router", () => ({
  __esModule: true,
  default: () => <div >Mocked Router</div>,
}));

describe("AppComponent", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("all shows correct if loading: true, isAuth: false ", () => {
    mockUseAppSelector.mockReturnValue({ loading: true, isAuth: false })
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    const spinner = screen.getByTestId("spinner");
    const header = screen.queryByTestId("header");
    const menu = screen.queryByTestId("menu");
    expect(spinner).toBeInTheDocument();
    expect(header).not.toBeInTheDocument();
    expect(menu).not.toBeInTheDocument();
  })

  test("all shows correct if loading: false, isAuth: true ", () => {


    mockUseAppSelector.mockReturnValue({ loading: false, isAuth: true })
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    const spinner = screen.queryByTestId("spinner");
    const header = screen.queryByTestId("mocked-header");
    const menu = screen.queryByTestId("mocked-menu");
    expect(spinner).not.toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(menu).toBeInTheDocument();
  })

  test("all shows correct if loading: false, isAuth: false ", () => {


    mockUseAppSelector.mockReturnValue({ loading: false, isAuth: false })
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    const spinner = screen.queryByTestId("spinner");
    const header = screen.queryByTestId("mocked-header");
    const menu = screen.queryByTestId("mocked-menu");
    expect(spinner).not.toBeInTheDocument();
    expect(header).not.toBeInTheDocument();
    expect(menu).not.toBeInTheDocument();
  })

  test("matches snapshot", () => {
    const { asFragment } = render(<App></App>);

    // Снимаем снапшот компонента
    expect(asFragment()).toMatchSnapshot();
  });
})