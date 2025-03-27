import MenuItem from "@mui/material/MenuItem";

interface IMenuItemComponent {
    children: React.ReactNode;
    onClick?: () => void;
    value?: string;
    className?: string
};

export default function MenuItemComponent({ children, onClick, value, className }: IMenuItemComponent) {
    return <MenuItem onClick={onClick} value={value} className={className}>{children}</MenuItem>
}