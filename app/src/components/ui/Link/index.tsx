import { memo, type MouseEvent, type ReactNode } from "react";
import Link from "@mui/material/Link";
import { type LinkProps } from "@mui/material/Link";

interface ILinkComponent extends LinkProps {
	href?: string;
	onClick?: () => void;
	children?: ReactNode;
};

// Базовый компонент ссылки
export default memo(function LinkComponent({ href, children, onClick, ...props }: ILinkComponent) {
	const onEvent = (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();

		if (onClick) onClick();
	};

	return <Link {...props} href={href} onClick={onEvent}>
		{children}
	</Link>;
});