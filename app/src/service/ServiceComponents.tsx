import React from "react";
import { useAppSelector } from "../hooks/useGlobalState";
import { selectMainState } from "../state/main/slice";
import ModalWithError from "../components/Modals/ModalWithError";
import ModalWithAttachments from "../components/Modals/ModalWithAttachments";
import ModalWithConfirm from "../components/Modals/ModalWithConfirm";
import ModalWithImagesCarousel from "../components/Modals/ModalWithImagesCarousel";
import SnackBarWithSocketError from "../components/Snackbars/SnackBarWithSocketError";
import SnackBarWithCall from "../components/Snackbars/SnackbarWithCall";
import ModalWithCall from "../components/Modals/ModalWithCall";
import Spinner from "../components/Common/Spinner";

export default React.memo(function ServiceComponents() {
    const { isAuth, loading } = useAppSelector(selectMainState);

    return <>
        <ModalWithError />

        {loading 
            ? <Spinner /> 
            : null
        }

        {isAuth
            ? <>
                <SnackBarWithSocketError />
                <SnackBarWithCall />
                <ModalWithCall />
                <ModalWithImagesCarousel />
                <ModalWithConfirm />
                <ModalWithAttachments />
            </>
            : null
        }
    </>
});