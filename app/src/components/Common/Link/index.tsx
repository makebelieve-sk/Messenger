import { Link as MuiLink, LinkProps } from "@mui/material";

type Ilink = {
	href?: string;
	onClick?: () => void;
	children?: React.ReactNode;
} & LinkProps;

export default function LinkComponent({
	children,
	onClick,
	href,
	...props
}: Ilink) {
	return (
		<MuiLink href={href} onClick={onClick} {...props}>
			{children}
		</MuiLink>
	);
}
