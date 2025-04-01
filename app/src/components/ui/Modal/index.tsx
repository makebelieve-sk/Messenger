import { JSX, useEffect } from "react";
import Portal from "@components/ui/portal";
import CloseIconComponent from "@components/icons/closeIcon";

import "./modal.scss";

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
          <CloseIconComponent className="modal-close" onClick={onClose} size="24" />
          {children}
        </div>
      </div>
    </Portal>
  )
}