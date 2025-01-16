import { Link as MuiLink, LinkProps } from "@mui/material";

interface ILinkComponent extends LinkProps {
	href?: string;
	onClick?: () => void;
	children?: React.ReactNode;
};

// Базовый компонент ссылки
export default function LinkComponent({ href, children, onClick, ...props }: ILinkComponent) {
	const onEvent = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		if (onClick) onClick();
	};

	return <MuiLink href={href} onClick={onEvent} {...props}>
		{children}
	</MuiLink>
}
