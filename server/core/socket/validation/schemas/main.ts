import { z } from "zod";

import { t } from "@service/i18n";
import { SocketActions } from "@custom-types/enums";

// Описание схемы отправки данных основных событий
export const emitMainSchema = {
    [SocketActions.SOCKET_CHANNEL_ERROR]: z.object({ message: z.string().min(1, t("validation.schema.error.required_socket_error")) })
}