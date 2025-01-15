import { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";

import SnackBarComponent from "../../../ui/Snackbar";
import { useAppSelector } from "../../../../hooks/useGlobalState";
import { selectErrorState } from "../../../../store/error/slice";

// Всплывающая подсказка с ошибкой по сокет соединению
export default function SnackBarWithSocketError() {
    const [openSnack, setOpenSnack] = useState(false);

    const { systemError } = useAppSelector(selectErrorState);

    // Открытие уведомления с ошибкой, переданной по сокету
    useEffect(() => {
        setOpenSnack(Boolean(systemError));
    }, [systemError]);

    // Закрытие окна с системной ошибкой
    const onCloseSnack = () => {
        setOpenSnack(false);
    };

    return <SnackBarComponent anchor={{ vertical: "bottom", horizontal: "left" }} open={openSnack} handleClose={onCloseSnack}>
        <Alert onClose={onCloseSnack} severity="error">
            {systemError}
        </Alert>
    </SnackBarComponent>
};