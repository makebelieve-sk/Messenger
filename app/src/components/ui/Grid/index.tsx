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

export default function GridComponent({ children, container, spacing, xs, sm, md, className, component, elevation, square }: IGridComponent) {
    return <Grid container={container} spacing={spacing || 2} size={{ xs, sm, md }} className={className || "gridItemStyle"} component={component || "div"} elevation={elevation} square={square}>{children}</Grid>
}