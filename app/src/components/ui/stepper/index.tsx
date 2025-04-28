import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";

interface IStepperComponent {
    steps: string[];
    activeStep: number;
};

export default function StepperComponent({ steps, activeStep }: IStepperComponent) {
    return <Stepper data-testid="stepper" activeStep={activeStep}>
        {steps.map(label => <Step data-testid="step" key={label}>
            <StepLabel>{label}</StepLabel>
        </Step>
        )}
    </Stepper>
}

