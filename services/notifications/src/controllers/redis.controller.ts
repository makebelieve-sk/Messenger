import { Redis } from "ioredis";
import { I18nService } from "nestjs-i18n";
import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import FileLogger from "src/services/logger.service";
import NotificationService from "src/services/notification.service";
import RedisService from "src/services/redis.service";
import { REDIS_CHANNEL } from "src/types/enums";
import { Controller, OnModuleInit } from "@nestjs/common";

interface ParsedMessage {
	pattern: REDIS_CHANNEL;
	data: string;
}

// Контроллер по подписке на канал сообщений Redis
@Controller(REDIS_CHANNEL.FAILED_NOTIFICATIONS)
export default class RedisController implements OnModuleInit {
	private subscriberClient: Redis;

	constructor(
		private readonly redisService: RedisService,
		private readonly logger: FileLogger,
		private readonly notifier: NotificationService,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(RedisController.name);
	}

	async onModuleInit() {
		this.logger.debug(
			this.i18n.t("redis.subscribing_new_channel", {
				args: { channel: REDIS_CHANNEL.FAILED_NOTIFICATIONS },
			}),
		);

		// Получаем отдельный клиент подписки (новый инстанс Redis, который подписывается на канал ошибочно завершенных задач)
		this.subscriberClient = await this.redisService.createSubscriber(
			REDIS_CHANNEL.FAILED_NOTIFICATIONS,
		);

		this.subscriberClient.on("message", (_: REDIS_CHANNEL, message) => {
			this.handleFailedNotifications(message);
		});
	}

	// Обработка приходящего события об неудачной задаче нотификации
	private async handleFailedNotifications(message: string) {
		try {
			const parsedMessage: ParsedMessage = JSON.parse(message);
			const data: NotificationQueueDto = JSON.parse(parsedMessage.data);

			this.logger.debug(this.i18n.t("redis.handling_message", { args: { data } }));

			const { type, recipient, payload, action } = data;

			// Выполняем входящую задачу на нотификацию
			await this.notifier.notify(type, recipient, payload, action);
		} catch (error) {
			this.logger.error(
				this.i18n.t("redis.failed_proceed_message", { args: { message, error } }),
			);
		}
	}
}
