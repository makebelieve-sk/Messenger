import Paper from "@mui/material/Paper";

interface IPaperComponent {
    children: React.ReactNode;
    className?: string;
    elevation?: number;
    square?: boolean;
};

// Базовый компонент пейпера
export default function PaperComponent({ children, className, elevation, square }: IPaperComponent) {
	return <Paper className={className} elevation={elevation} square={square}>{children}</Paper>;
}