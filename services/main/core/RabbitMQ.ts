import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from "amqplib";
import { NOTIFICATION_TYPE, RABBITMQ_QUEUE, STRATEGY_ACTION } from "common-types";

import { t } from "@service/i18n";
import Logger from "@service/logger";
import { BaseError, RabbitMQError } from "@errors/index";
import { RABBITMQ_RECONNECTION, RABBITMQ_URL } from "@utils/constants";

interface INotificationMessage {
    type: NOTIFICATION_TYPE;
    recipient: string;
    payload: string;
    action: STRATEGY_ACTION;
};

interface IErrorMessage {
    type: string;
    reason: string;
    at: string;
};

const logger = Logger("RabbitMQ");
const RABBIT_MQ_QUEUES = [ RABBITMQ_QUEUE.ERROR_NOTIFICATION_QUEUE, RABBITMQ_QUEUE.ERROR_QUEUE ];

// Класс, отвечает за работу с клиентом RabbitMQ
export default class RabbitMQWorks {
	private _connection!: ChannelModel;
	private _channel!: Channel;

	constructor() {
		this._init();
	}

	private async _init() {
		this._connection = await amqp.connect(RABBITMQ_URL);

		logger.info(t("rabbitmq.successfully_connected"));

		this._bindConnectionListeners();

		this._channel = await this._connection.createChannel();

		logger.info(t("rabbitmq.successfully_create_channel"));

		this._bindChannelListeners();
		this._consumeAll();
	}

	private _bindConnectionListeners() {
		this._connection.on("error", this._onError.bind(this));
		this._connection.on("close", () => logger.info(t("rabbitmq.connection_closed")));
	}

	private _bindChannelListeners() {
		this._channel.on("error", this._onChannelError.bind(this));
		this._channel.on("close", () => logger.info(t("rabbitmq.channel_closed")));
	}

	// Отправка сообщения в очередь канала
	async publish(queue: RABBITMQ_QUEUE, data: Object) {
		try {
			// Оборачиваем в объект вида pattern и data для общепринятого формата RabbitMQ для Nest.js
			const envelope = { pattern: queue, data };

			logger.info(t("rabbitmq.send_message", { message: JSON.stringify(envelope.data) }));

			await this._channel.assertQueue(queue, { durable: true });

			const ok = this._channel.sendToQueue(queue, Buffer.from(JSON.stringify(envelope)), {
				persistent: true, // Сохранять на диск
			});

			if (!ok) {
				logger.warn(t("rabbitmq.message_not_published"));
			}
		} catch (error) {
			const nextError = error instanceof Error
				? error
				: new RabbitMQError((error as Error).message);

			logger.error(t("rabbitmq.error_send_message", { error: nextError.message }));
		}
	}

	private _consumeAll() {
		for (const queue of RABBIT_MQ_QUEUES) {
			this._consume(queue);
		}
	}

	private async _consume(queue: RABBITMQ_QUEUE) {
		await this._channel.assertQueue(queue, { durable: true });
		// Конфигурируем QoS: получать по одному сообщению за раз
		this._channel.prefetch(1);

		logger.info(t("rabbitmq.successfully_create_consumer", { queue }));

		this._channel.consume(queue, msg => this.handleMessages(queue, msg), { noAck: false });
	}

	private async handleMessages(queue: RABBITMQ_QUEUE, msg: ConsumeMessage | null) {
		if (!msg) return;

		try {
			const content = msg.content.toString();
			const { data }: { data: INotificationMessage | IErrorMessage; } = JSON.parse(content);

			switch (queue) {
			case RABBITMQ_QUEUE.ERROR_NOTIFICATION_QUEUE: {
				const { type, recipient, payload, action } = data as INotificationMessage;
				logger.error(t("rabbitmq.error.error_notification_queue", { type, recipient, payload, action }));
				break;
			}
			case RABBITMQ_QUEUE.ERROR_QUEUE: {
				const { type, reason, at } = data as IErrorMessage;
                    
				reason === "SIGINT"
					? logger.info(t("rabbitmq.service_stopped_normally", { type, reason, at }))
					: logger.error(t("rabbitmq.error.error_queue", { type, reason, at }));
                    
				break;
			}
			default:
				logger.error(t("rabbitmq.unknown_queue", { queue }));
				return;
			}

			logger.debug(t("rabbitmq.message_processed", { content }));
			this._channel.ack(msg); // Отправляем обратно успешное подтверждение
		} catch (error) {
			const nextError = error instanceof BaseError
				? error
				: new RabbitMQError((error as Error).message);

			logger.error(t("rabbitmq.error_handle_message", { error: nextError.message }));
			this._channel.nack(msg, false, false); // Удаляем ошибочное сообщение из очереди, не обрабатывая его
		}
	}

	private _onError(error: Error) {
		logger.error(t("rabbitmq.connection_error", { error: error.message }));

		this.close();
		this._reconnection();
	}

	private _onChannelError(error: Error) {
		logger.error(t("rabbitmq.channel_error", { error: error.message }));

		this.close();
		this._reconnection();
	}

	private _reconnection() {
		logger.info(t("rabbitmq.try_reconnection", { time: (RABBITMQ_RECONNECTION / 1000).toString() }));

		setTimeout(() => this._init(), RABBITMQ_RECONNECTION);
	}

	async close() {
		try {
			if (this._channel) {
				await this._channel.close();
				logger.info(t("rabbitmq.channel_closed"));
			}

			if (this._connection) {
				await this._connection.close();
				logger.info(t("rabbitmq.connection_closed"));
			}
		} catch (error) {
			const nextError = error instanceof BaseError
				? error
				: new RabbitMQError((error as Error).message);

			logger.error(t("rabbitmq.error_close_connection", { error: nextError.message }));
		}
	}
};