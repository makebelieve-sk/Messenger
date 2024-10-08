import React from "react";

import { useAppSelector } from "../hooks/useGlobalState";
import { selectMainState } from "../state/main/slice";
import ModalWithError from "../components/Modals/ModalWithError";
import ModalWithAttachments from "../components/Modals/ModalWithAttachments";
import ModalWithConfirm from "../components/Modals/ModalWithConfirm";
import ModalWithImagesCarousel from "../components/Modals/ModalWithImagesCarousel";
import SnackBarWithSocketError from "../components/Snackbars/SnackBarWithSocketError";
// import SnackBarWithCall from "../components/Snackbars/SnackbarWithCall";
// import ModalWithCall from "../components/Modals/ModalWithCall";

export default React.memo(function ServiceComponents() {
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
});