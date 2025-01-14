import { memo } from "react";
import CircularProgress from "@mui/material/CircularProgress";

import "./spinner.scss";

// Базовый компонент спиннера загрузки
export default memo(function SpinnerComponent() {
    return <div className="spinner">
        <CircularProgress />
    </div>
});