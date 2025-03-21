import { createPortal } from "react-dom";
import { JSX, useEffect, useState } from "react";

import Info from "@modules/carousel/info";
import { ICarouselData } from "@components/services/modals/carousel/index";

import "./common-modal.scss"

interface IModalProps {
  data: ICarouselData
  isOpen: boolean
  onClose: () => void
  children: JSX.Element;
  className?: string;
  title: string;
  description: string;
}
//  Основной компонент модального окна
const CommonModal = ({
  data,
  isOpen,
  onClose,
  children,
  className = "",
  title,
  description
}: IModalProps) => {
  if (!isOpen) return null;

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  const [activeKey, setActiveKey] = useState(data.index);

  const images = data.images;
  
  return createPortal(
    <div className={`modal-overlay ${className}`} onClick={onClose} role="dialog"
      aria-labelledby={title} aria-describedby={description}
    >
      <div className="carousel__info">
        <Info activeImage={images[activeKey]} />
      </div>
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