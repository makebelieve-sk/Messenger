import Box from "@mui/material/Box";

interface IBoxComponent {
    children: React.ReactNode;
    className?: string;
    component?: "section" | "form" | "div" | "span";
    noValidate?: boolean;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function BoxComponent({ children, className, component, noValidate, onSubmit }: IBoxComponent) {
    return <Box className={className} component={component || "div"} noValidate={noValidate} onSubmit={onSubmit}>{children}</Box>;
}