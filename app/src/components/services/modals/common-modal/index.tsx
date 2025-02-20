import { createPortal } from "react-dom";
import { JSX } from "react";

import "./common-modal.scss"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: JSX.Element;
  className?: string;
  title: string;
  description: string;
}

const CommonModal = ({
  isOpen,
  onClose,
  children,
  className = "",
  title,
  description
}: ModalProps) => {
  if (!isOpen) return null;

  // This component is made so that when we have a lot of modals we will have the main component of the modal and This is him
  return createPortal(
    <div className={`modal-overlay ${className}`} onClick={onClose} role="dialog"
      aria-labelledby={title} aria-describedby={description}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
    ,
    document.body
  )
}

export default CommonModal