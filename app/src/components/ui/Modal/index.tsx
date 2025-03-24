import { JSX } from "react";

import CloseIcon from "@mui/icons-material/Close";
import Portal from "@components/ui/Portal";

import "./common-modal.scss";

interface IModalProps {
  isOpen: boolean
  onClose: () => void
  children: JSX.Element;
  className?: string;
  title: string;
  description: string;
  extraContent?: JSX.Element
};

//  Основной компонент модального окна
export default function CommonModal({
  isOpen,
  onClose,
  children,
  className = "",
  title,
  description,
  extraContent
}: IModalProps) {
  if (!isOpen) return null;

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
          <button className="modal-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
          {children}
        </div>
      </div>
    </Portal>
  )
}