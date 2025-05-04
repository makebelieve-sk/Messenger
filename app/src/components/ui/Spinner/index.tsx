import CircularProgress from "@mui/material/CircularProgress";

import "./spinner.scss";

// Базовый компонент спиннера загрузки
export default function SpinnerComponent() {
	return <div data-testid="spinner" className="spinner">
		<CircularProgress />
	</div>;
};