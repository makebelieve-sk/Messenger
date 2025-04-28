import { render, screen } from "@testing-library/react";

import ButtonComponent from "@components/ui/button";

describe("ButtonComponent", () => {
    test("render with children", () => {
        render(<ButtonComponent>Test Button</ButtonComponent>);
        const button = screen.getByText("Test Button");
        expect(button).toBeInTheDocument();
    })

    test("render with className", () => {
        render(<ButtonComponent className="custom-class">Test Button</ButtonComponent>);
        const button = screen.getByText("Test Button");
        expect(button).toHaveClass("custom-class");
    })

     test("matches snapshot", () => {
        const { asFragment } = render(<ButtonComponent>Test</ButtonComponent>);
    
        // Снимаем снапшот компонента
        expect(asFragment()).toMatchSnapshot();
      });
});