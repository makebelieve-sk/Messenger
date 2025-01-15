import ModalWithError from "../services/modals/ModalWithError";
import ModalWithAttachments from "../services/modals/ModalWithAttachments";
import ModalWithConfirm from "../services/modals/ModalWithConfirm";
import ModalWithImagesCarousel from "../services/modals/ModalWithImagesCarousel";
import SnackBarWithSocketError from "../services/snackbars/SnackBarWithSocketError";
import { useAppSelector } from "../../hooks/useGlobalState";
import { selectMainState } from "../../store/main/slice";

// Компонент, содержащий дополнительные "сервисные" модули, такие как всплывающие/модальные окна и подсказки
export default function ServiceComponents() {
    const { isAuth } = useAppSelector(selectMainState);

    return <>
        <ModalWithError />
        <ModalWithConfirm />

        {isAuth
            ? <>
                <SnackBarWithSocketError />
                {/* <SnackBarWithCall /> */}
                {/* <ModalWithCall /> */}
                <ModalWithImagesCarousel />
                <ModalWithAttachments />
            </>
            : null
        }
    </>
};