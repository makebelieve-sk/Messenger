import { memo } from "react";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";

interface IStepperComponent {
	steps: string[];
	activeStep: number;
};

// Базовый компонент степпера
export default memo(function StepperComponent({ steps, activeStep }: IStepperComponent) {
	return <Stepper data-testid="stepper" activeStep={activeStep}>
		{
			steps.map(label => {
				return <Step key={label} data-testid="step">
					<StepLabel>{label}</StepLabel>
				</Step>;
			})
		}
	</Stepper>;
});