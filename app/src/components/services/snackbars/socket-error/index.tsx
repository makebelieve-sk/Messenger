import { useState, useEffect } from "react";
import AlertComponent from "@components/ui/alert";
import SnackBarComponent from "@components/ui/snackbar";
import { useAppSelector } from "@hooks/useGlobalState";
import { selectErrorState } from "@store/error/slice";

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
        <AlertComponent onClose={onCloseSnack} severity="error">
            {systemError}
        </AlertComponent>
    </SnackBarComponent>
};