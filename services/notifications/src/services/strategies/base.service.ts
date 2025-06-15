import { randomInt } from "crypto";
import { I18nService } from "nestjs-i18n";
import { PayloadNotificationDto } from "src/dto/rabbitmq.dto";
import StrategyError from "src/errors/strategy.error";
import RedisService from "src/services/redis.service";
import PincodesService from "src/services/tables/pincodes.service";
import SentNotificationsService from "src/services/tables/sent-notifications.service";
import TelegramUsersService from "src/services/tables/telegram-users.service";
import UsersService from "src/services/tables/users.service";
import {
	NOTIFICATION_TYPE,
	REDIS_CHANNEL,
	STRATEGY_ACTION,
} from "src/types/enums";
import { Inject } from "@nestjs/common";

const MAX_ATTEMPTS = 10;

// Базовый абстрактный класс сервиса стратегии
export default abstract class BaseStrategyService {
	@Inject(I18nService) protected readonly i18n!: I18nService;
	@Inject(UsersService) protected readonly usersService!: UsersService;
	@Inject(RedisService) protected readonly redisService!: RedisService;
	@Inject(SentNotificationsService)
	protected readonly sentNotificationsService!: SentNotificationsService;
	@Inject(PincodesService) protected readonly pincodesService!: PincodesService;
	@Inject(TelegramUsersService)
	protected readonly telegramUsersService!: TelegramUsersService;

	protected constructor(protected readonly strategyType: NOTIFICATION_TYPE) {}

	protected async updateDatabase(
		recipient: string,
		payload: PayloadNotificationDto,
		action: STRATEGY_ACTION,
		pincode: number,
	) {
		// Записываем успешное выполнение отправки уведомления в базу данных
		await this.sentNotificationsService.create({
			recipientId: recipient,
			type: NOTIFICATION_TYPE.EMAIL,
			payload: JSON.stringify(payload),
			action,
			success: true,
		});

		if (pincode && action === STRATEGY_ACTION.PINCODE) {
			// Записываем новый пинкод для текущего пользователя
			await this.pincodesService.create({
				userId: recipient,
				pincode,
				expiresAt: new Date(Date.now() + 5 * 60 * 1000),
				attempts: 0,
			});
		}
	}

	// Получение поля, по которому будет происходить нотификация (почта/телефон указанного пользователя)
	protected async getField(userId: string): Promise<string | number> {
		switch (this.strategyType) {
			case NOTIFICATION_TYPE.EMAIL: {
				const foundUser = await this.usersService.findOne(userId);

				if (!foundUser || !foundUser.email) {
					throw new StrategyError(this.i18n.t("strategies.email_not_found"));
				}

				return foundUser.email;
			}
			case NOTIFICATION_TYPE.SMS:
				throw new StrategyError(this.i18n.t("strategies.not_implemented"));
			case NOTIFICATION_TYPE.TELEGRAM: {
				const foundTelegramUser = await this.telegramUsersService.findOneBy({
					userId,
				});

				if (!foundTelegramUser || !foundTelegramUser.telegramId) {
					throw new StrategyError(this.i18n.t("strategies.telegram_id_not_found"));
				}

				return foundTelegramUser.telegramId;
			}
			default:
				throw new StrategyError(this.i18n.t("strategies.incorrect_strategy"));
		}
	}

	// Генерация пин-кода для сброса пароля
	protected async getPincode(userId: string) {
		try {
			let pincode: number | undefined;

			for (let i = 1; i <= MAX_ATTEMPTS; i++) {
				const temporaryPincode = this.generatePincode();

				const ack = await this.redisService.publishWithAck(
					REDIS_CHANNEL.PINCODE_SET,
					{
						userId: userId,
						pincode: temporaryPincode,
					},
				);

				// Если ответ успешен - пинкод не повторяется в Redis и мы его возвращаем
				if (ack) {
					pincode = temporaryPincode;
					break;
				}

				// Иначе коллизия — продолжаем цикл
			}

			if (!pincode) {
				throw new StrategyError(this.i18n.t("strategies.pin_generation_failed"));
			}

			return pincode;
		} catch (error) {
			throw new StrategyError(
				this.i18n.t("strategies.pin_generation_failed", {
					args: {
						attempts: MAX_ATTEMPTS,
						error: error ? `: ${error.message}` : "",
					},
				}),
			);
		}
	}

	// Случайный 6‑значный PIN-код (строка с ведущими нулями)
	private generatePincode() {
		const num = randomInt(0, 1_000_000);
		return parseInt(num.toString().padStart(6, "0"));
	}
}
