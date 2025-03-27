import Typography from "@mui/material/Typography";
import { ElementType } from "react";

interface ITypographyComponent {
    children: React.ReactNode;
    variant?: "body1"
    | "body2"
    | "button"
    | "caption"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "inherit"
    | "overline"
    | "subtitle1"
    | "subtitle2";
    className?: string;
    id?: string;
    component?: ElementType;
};

export default function TypographyComponent({ children, variant, className, id, component }: ITypographyComponent) {
    return <Typography variant={variant || "body1"} className={className} id={id} component={component || "p"} >{children}</Typography>
}