import { JSX } from "react"
import CommonModal from "../common-modal";

interface CarouselModalProps  {
    isOpen: boolean;
    onClose: () => void;
    children: JSX.Element;
    title: string;
    description: string;
}

const CarouselModal = ({ isOpen, onClose, children, title, description }: CarouselModalProps ) => {
    return <CommonModal isOpen={isOpen} onClose={onClose} children={children} title={title} description={description}></CommonModal>
}

export default CarouselModal