import { ElementType } from "react";
import Grid from "@mui/material/Grid2";

import "./grid.scss";

interface IGridComponent {
    children?: React.ReactNode;
    className?: string;
    container?: boolean;
    spacing?: number;
    xs?: number;
    sm?: number;
    md?: number;
    component?: ElementType;
    elevation?: number;
    square?: boolean
};

// Базовый компонент грида
export default function GridComponent({ children, container, spacing = 2, xs, sm, md, className = "grid-item-style", component = "div", elevation, square }: IGridComponent) {
    return <Grid
        container={container}
        spacing={spacing}
        size={{ xs, sm, md }}
        className={className}
        component={component}
        elevation={elevation}
        square={square}
    >
        {children}
    </Grid>
}