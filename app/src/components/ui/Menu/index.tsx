import Menu from "@mui/material/Menu";

interface IMenuComponent {
    children: React.ReactNode;
    id: string;
    anchorEl: HTMLElement | null;
    anchorOrigin: {
        vertical: "top" | "bottom";
        horizontal: "left" | "center" | "right";
    };
    open: boolean;
    autoFocus: boolean;
    onClose: () => void;
};

export default function MenuComponent({ children, id, anchorEl, anchorOrigin, open, autoFocus, onClose }: IMenuComponent) {
    return <Menu id={id} anchorEl={anchorEl} anchorOrigin={anchorOrigin} open={open} autoFocus={autoFocus} onClose={onClose}>{children}</Menu>;
}