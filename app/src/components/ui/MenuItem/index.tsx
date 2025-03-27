import MenuItem from "@mui/material/MenuItem";

interface IMenuItemComponent {
    children: React.ReactNode;
    onClick?: () => void;
    value?: string;
};

export default function MenuItemComponent({ children, onClick, value }: IMenuItemComponent) {
    return <MenuItem onClick={onClick} value={value}>{children}</MenuItem>
}