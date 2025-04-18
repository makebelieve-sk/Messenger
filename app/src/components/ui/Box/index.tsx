import Box from "@mui/material/Box";

interface IBoxComponent {
    children: React.ReactNode;
    className?: string;
    component?: "section" | "form" | "div" | "span";
    noValidate?: boolean;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
};

// Базовый компонент бокса
export default function BoxComponent({ children, className, component = "div", noValidate, onSubmit }: IBoxComponent) {
	return <Box
		className={className}
		component={component}
		noValidate={noValidate}
		onSubmit={onSubmit}
	>
		{children}
	</Box>;
}