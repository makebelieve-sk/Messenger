import { HTTPStatuses } from "common-types";

import { CLIENT_URL } from "@utils/constants";
import { oneHour } from "@utils/datetime";

// Конфигурация политики CORS
const corsConfig = {
	credentials: true, // Разрешает отправку и обработку cookies на клиенте
	origin: CLIENT_URL, // Какие домены/протоколы/порты могут отправлять запросы к серверу
	methods: [ "GET", "POST", "PUT", "DELETE" ], // Какие http-методы разрешены
	maxAge: oneHour, // Время, в течении которого браузер кеширует результаты preflight-запросов (OPTIONS)
	preflightContinue: false, // Отключаем продолжение preflight запросов
	optionsSuccessStatus: HTTPStatuses.NoContent, // Статус успешного ответа для OPTIONS запросов
};

export default corsConfig;
