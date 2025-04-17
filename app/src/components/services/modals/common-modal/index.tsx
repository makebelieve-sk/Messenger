import { JSX } from "react";
import { createPortal } from "react-dom";

import "./common-modal.scss";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: JSX.Element;
	className?: string;
	title: string;
	description: string;
};

//  Основной компонент модального окна
const CommonModal = ({ isOpen, onClose, children, className = "", title, description }: ModalProps) => {
	if (!isOpen) return null;

	return createPortal(
		<div className={`modal-overlay ${className}`} onClick={onClose} role="dialog" aria-labelledby={title} aria-describedby={description}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<button className="modal-close" onClick={onClose}>
					×
				</button>
				{children}
			</div>
		</div>,
		document.body,
	);
};

export default CommonModal;
