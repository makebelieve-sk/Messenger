import React from "react";
import Alert from "@mui/material/Alert";
import { useAppSelector } from "../../../hooks/useGlobalState";
import { selectErrorState } from "../../../state/error/slice";
import SnackBarComponent from "../../Common/Snackbar";

export default React.memo(function SnackBarWithSocketError() {
    const [openSnack, setOpenSnack] = React.useState(false);

    const { systemError } = useAppSelector(selectErrorState);
    
    // Открытие уведомления с ошибкой, переданной по сокету
    React.useEffect(() => {
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
});