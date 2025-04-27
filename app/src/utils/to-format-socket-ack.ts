import { type ValidateHandleReturnType } from "@core/socket/validation";
import { type CallbackAckType } from "@custom-types/socket.types";

// Формирование подтверждения сокет-события для отправки обратно на сервер
export default function toFormatAck(validateData: ValidateHandleReturnType, cb: CallbackAckType, extraCb?: Function) {
	const ackData = validateData.success 
		? { success: true, timestamp: Date.now() } 
		: { success: false, message: validateData.message };

	cb(ackData);

	if (extraCb) extraCb();
};