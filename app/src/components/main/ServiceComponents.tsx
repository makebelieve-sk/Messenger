import ModalWithError from "@components/services/modals/ModalWithError";
import ModalWithAttachments from "@components/services/modals/ModalWithAttachments";
import ModalWithConfirm from "@components/services/modals/ModalWithConfirm";
import ModalWithImagesCarousel from "@components/services/modals/ModalWithImagesCarousel";
import SnackBarWithSocketError from "@components/services/snackbars/SnackBarWithSocketError";
import { useAppSelector } from "@hooks/useGlobalState";
import { selectMainState } from "@store/main/slice";

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