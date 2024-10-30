import { Link as MuiLink, LinkProps } from "@mui/material";
import { useCallback } from "react";

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
	const onEvent = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			e.preventDefault();
			if (onClick) onClick();
		},
		[onClick]
	);

	return (
		<MuiLink href={href} onClick={onEvent} {...props}>
			{children}
		</MuiLink>
	);
}
