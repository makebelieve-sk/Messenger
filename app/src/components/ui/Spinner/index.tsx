import CircularProgress from "@mui/material/CircularProgress";

import "./spinner.scss";

// Базовый компонент спиннера загрузки
export default function SpinnerComponent() {
    return <div className="spinner">
        <CircularProgress />
    </div>
};