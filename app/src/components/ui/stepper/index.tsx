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
	return <Stepper activeStep={activeStep}>
		{
			steps.map(label => {
				return <Step key={label}>
					<StepLabel>{label}</StepLabel>
				</Step>;
			})
		}
	</Stepper>;
});
