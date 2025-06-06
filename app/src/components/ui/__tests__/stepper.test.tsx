import { render, screen } from "@testing-library/react";

import StepperComponent from "@components/ui/stepper";

describe("StepperComponent", () => {
	test("StepperComponent shows correct", () => {
		render(<StepperComponent steps={[]} activeStep={0}></StepperComponent>);
		const stepperElement = screen.getByTestId("stepper");
		expect(stepperElement).toBeInTheDocument();
	});
	test("StepperComponent render childrens", () => {
		render(<StepperComponent steps={[ "1", "2", "3" ]} activeStep={0}></StepperComponent>);
		const stepElement = screen.getAllByTestId("step");
		expect(stepElement).toHaveLength(3);
	});

	test("matches snapshot", () => {
		const { asFragment } = render(<StepperComponent steps={[]} activeStep={0}></StepperComponent>);

		expect(asFragment()).toMatchSnapshot();
	});
});