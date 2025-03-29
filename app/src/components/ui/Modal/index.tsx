import { JSX, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Portal from "@components/ui/portal";

import "./common-modal.scss";

interface IModalProps {
  isOpen?: boolean
  onClose?: (event?: Object, reason?: string) => void
  children?: JSX.Element;
  className?: string;
  title?: string;
  description?: string;
  extraContent?: JSX.Element;
  disableEscapeKeyDown?: boolean;
};

// Базовый компонент модального окна
export default function ModalComponent({
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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose?.();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, disableEscapeKeyDown]);

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