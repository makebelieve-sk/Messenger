import { Link as MuiLink, LinkProps } from "@mui/material";

type LinkComponentType = {
	href?: string;
	onClick?: () => void;
	children?: React.ReactNode;
} & LinkProps;

export default function LinkComponent({
	children,
	onClick,
	href,
	...props
}: LinkComponentType) {
	const onEvent = (
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			e.preventDefault();
			if (onClick) onClick();
		}
	);

	return (
		<MuiLink href={href} onClick={onEvent} {...props} variant="body2">
			{children}
		</MuiLink>
	);
}
