import { HTTPStatuses } from "common-types";

import { t } from "@service/i18n";
import Logger from "@service/logger";
import { PassportError } from "@errors/index";

const logger = Logger("utils/get-google-phone-number");

export async function getPhoneNumber(google, accessToken) {
	const oauth2Client = new google.auth.OAuth2();
	oauth2Client.setCredentials({ access_token: accessToken });

	const people = google.people({ version: "v1", auth: oauth2Client });

	try {
		const res = await people.people.get({
			resourceName: "people/me",
			personFields: "phoneNumbers",
		});

		if (res.data.phoneNumbers) {
			const phone = res.data.phoneNumbers[0].value;
			logger.debug(t("oauth.google.phone_number.success", { phone }));
			return phone;
		} else {
			logger.debug(t("oauth.google.phone_number.not_found"));
			return null;
		}
	} catch (err) {
		//TODO сделать локализацию, Лёха как проверит номер удалит логи
		const errorMessage = err instanceof Error ? err.message : String(err);
		logger.error(t("oauth.google.phone_number.error", { error: errorMessage }));
		throw new PassportError(
			t("oauth.google.phone_number.error", { error: errorMessage }),
			HTTPStatuses.ServerError,
		);
	}
}