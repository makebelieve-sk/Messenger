import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AlertComponent from "@components/ui/alert";

describe("AlertComponent", () => {
    test("should render Alert", () => {
        render(<AlertComponent show={true} status="success" onClose={() => { }} severity="success">Test Alert</AlertComponent>);
        const alertElement = screen.getByText("Test Alert");
        expect(alertElement).toBeInTheDocument();
    }
    );

    test("uses default status when not provided", () => {
        render(<AlertComponent show={true}>Alert Content</AlertComponent>);
        const alert = screen.getByRole("alert");
        expect(alert).toHaveClass("MuiAlert-colorSuccess");
    });

    test("should call onClose when close button is clicked", async () => {
        const user = userEvent.setup();
        const handleClose = jest.fn();
        render(<AlertComponent show={true} status="success" onClose={handleClose} severity="success">Test Alert</AlertComponent>);
        const closeButton = screen.getByRole("button");
        await user.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
    }
    );

    test("matches snapshot", () => {
        const { asFragment } = render(<AlertComponent></AlertComponent>);

        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
    });
});