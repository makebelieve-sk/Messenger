import CircularProgress from "@mui/material/CircularProgress";

import "./spinner.scss";

// Базовый компонент спиннера загрузки
export default function SpinnerComponent({ size = 40 }: { size?: number; }) {
	return <div data-testid="spinner" className="spinner">
		<CircularProgress size={size} />
	</div>;
};