import { type ElementType, memo, type ReactNode } from "react";
import Grid from "@mui/material/Grid2";

import "./grid.scss";

interface IGridComponent {
    children?: ReactNode;
    className?: string;
    container?: boolean;
    spacing?: number;
    xs?: number;
    sm?: number;
    md?: number;
    component?: ElementType;
    elevation?: number;
    square?: boolean;
    direction?: "row" | "column";
};

// Базовый компонент сетки
export default memo(function GridComponent({ 
	children, 
	container, 
	spacing = 2, 
	xs, 
	sm, 
	md, 
	className = "grid-item-style", 
	component = "div", 
	elevation, 
	square,
	direction = undefined,
}: IGridComponent) {
	return <Grid
		container={container}
		spacing={spacing}
		size={{ xs, sm, md }}
		className={className}
		component={component}
		elevation={elevation}
		square={square}
		direction={direction}
	>
		{children}
	</Grid>;
});