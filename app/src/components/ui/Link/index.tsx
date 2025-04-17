import LinkMUI from "@mui/material/Link";
import { type LinkProps } from "@mui/material/Link";

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

	return <LinkMUI href={href} onClick={onEvent} {...props}>
		{children}
	</LinkMUI>;
}
