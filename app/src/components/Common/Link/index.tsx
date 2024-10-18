import { Link as MuiLink } from "@mui/material";

type Ilink = {
	href?: string;
	onClick?: () => void;
	children?: React.ReactNode;
};

export default function Link({ children, onClick, href, ...props }: Ilink) {
	return (
		<MuiLink href={href} onClick={onClick} {...props}>
			{children}
		</MuiLink>
	);
}
