import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

interface IStepperComponent {
    steps: string[];
    activeStep: number;
};

export default function StepperComponent({ steps, activeStep }: IStepperComponent) {
    return <Stepper activeStep={activeStep}>
        {steps.map(label => <Step key={label}>
            <StepLabel>{label}</StepLabel>
        </Step>
        )}
    </Stepper>
}

