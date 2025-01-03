import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

import "./spinner.scss";

export default function Spinner() {
    return <div className="spinner">
        <CircularProgress />
    </div>
};