import { JSX, useEffect } from "react";

import CloseIcon from "@mui/icons-material/Close";
import Portal from "@components/ui/Portal";

import "./common-modal.scss";

interface IModalProps {
  isOpen?: boolean
  onClose?: () => void
  children?: JSX.Element;
  className?: string;
  title?: string;
  description?: string;
  extraContent?: JSX.Element;
  disableEscapeKeyDown?: boolean;
};

//  Основной компонент модального окна
export default function CommonModal({
  isOpen,
  onClose,
  children,
  className = "",
  title,
  description,
  extraContent,
  disableEscapeKeyDown = false
}: IModalProps) {
  if (!isOpen) return null;

  useEffect(() => {
    if (!isOpen || disableEscapeKeyDown) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.(); 
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, disableEscapeKeyDown, onClose]);

  return (
    <Portal containerId="modal-root">
      <div
        className={`modal-overlay ${className}`}
        onClick={onClose}
        role="dialog"
        aria-labelledby={title}
        aria-describedby={description}
      >
        {extraContent && <div className="modal-extra">{extraContent}</div>}

        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <CloseIcon className="modal-close" onClick={onClose} />
          {children}
        </div>
      </div>
    </Portal>
  )
}