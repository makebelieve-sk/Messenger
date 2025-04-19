import { ChangeEvent, memo } from "react";

import TextFieldComponent from "@components/ui/text-field";
import { type ITabModule } from "@modules/edit";
import i18next from "@service/i18n";

// Вкладка "Контакты" на странице редактирования
export default memo(function Contacts({ formValues, formErrors, onChange }: ITabModule) {
	return <>
		<TextFieldComponent
			id="city"
			name="city"
			margin="normal"
			variant="outlined"
			label={i18next.t("edit_tabs.city")}
			autoComplete={i18next.t("edit_tabs.city")}
			fullWidth
			value={formValues.city}
			autoFocus
			onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("city", e.target.value)}
		/>

		<TextFieldComponent
			id="phone"
			name="phone"
			margin="normal"
			variant="outlined"
			label={i18next.t("edit_tabs.phone")}
			autoComplete={i18next.t("edit_tabs.phone")}
			fullWidth
			value={formValues.phone}
			required
			error={Boolean(formErrors && formErrors.phone)}
			helperText={formErrors && formErrors.phone ? formErrors && formErrors.phone : null}
			onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("phone", e.target.value)}
		/>

		<TextFieldComponent
			id="email"
			name="email"
			margin="normal"
			variant="outlined"
			label={i18next.t("edit_tabs.email")}
			autoComplete={i18next.t("edit_tabs.email")}
			fullWidth
			value={formValues.email}
			required
			error={Boolean(formErrors && formErrors.email)}
			helperText={formErrors && formErrors.email ? formErrors && formErrors.email : null}
			onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("email", e.target.value)}
		/>
	</>;
});
