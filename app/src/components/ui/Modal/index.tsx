import { memo, type MouseEvent, type ReactNode, useEffect } from "react";

import CloseIconComponent from "@components/icons/close";
import Portal from "@components/ui/portal";

import "./modal.scss";

interface IModalProps {
	open?: boolean
	onClose?: (event?: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => void
	children?: ReactNode;
	className?: string;
	title?: string;
	description?: string;
	extraContent?: ReactNode;
	disableEscapeKeyDown?: boolean;
};

const ESCAPE_REASON = "Escape";

// Базовый компонент модального окна
export default memo(function ModalComponent({
	open,
	onClose,
	children,
	className = "",
	title,
	description,
	extraContent,
	disableEscapeKeyDown = false,
}: IModalProps) {
	if (!open) return null;

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);

		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [ open, disableEscapeKeyDown ]);

	// Обработка закрытия модального окна при нажатии на "Escape"
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === ESCAPE_REASON) {
			onClose?.();
		}
	};

	const onClickContent = (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
		event.stopPropagation();
	};

	return <Portal containerId="modal-root">
		<div
			className={`modal-overlay ${className}`}
			onClick={onClose}
			role="dialog"
			aria-labelledby={title}
			aria-describedby={description}
		>
			{
				extraContent && 
				<div className="modal-extra">
					{extraContent}
				</div>
			}

			<div className="modal-content" onClick={onClickContent}>
				<CloseIconComponent 
					size="24"
					className="modal-close" 
					onClick={onClose}
				/>

				{children}
			</div>
		</div>
	</Portal>;
});
