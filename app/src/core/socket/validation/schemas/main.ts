import { SocketActions } from "common-types";
import { z } from "zod";

import i18next from "@service/i18n";

// Описание схемы отправки данных основных событий
export const handleMainSchema = {
	[SocketActions.SOCKET_CHANNEL_ERROR]: z.object({ message: z.string().min(1, i18next.t("validation.schema.error.required_socket_error")) }),
};