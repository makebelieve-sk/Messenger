import { memo } from "react";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";

import { ITabModule } from "@modules/edit";

export default memo(function Contacts({
	formValues,
	formErrors,
	onChange,
}: ITabModule) {
	const onChangeField = (
		field: string,
		value: string | boolean | Date | null
	) => onChange(field, value);
	const { t } = useTranslation();
	return (
		<>
			<TextField
				id="city"
				name="city"
				margin="normal"
				variant="outlined"
				label={t("edit_tabs.city")}
				autoComplete={t("edit_tabs.city")}
				fullWidth
				value={formValues.city}
				autoFocus
				onChange={(e) => onChangeField("city", e.target.value)}
			/>

			<TextField
				id="phone"
				name="phone"
				margin="normal"
				variant="outlined"
				label={t("edit_tabs.phone")}
				autoComplete={t("edit_tabs.phone")}
				fullWidth
				value={formValues.phone}
				required
				error={Boolean(formErrors && formErrors.phone)}
				helperText={
					formErrors && formErrors.phone
						? formErrors && formErrors.phone
						: null
				}
				onChange={(e) => onChangeField("phone", e.target.value)}
			/>

			<TextField
				id="email"
				name="email"
				margin="normal"
				variant="outlined"
				label={t("edit_tabs.email")}
				autoComplete={t("edit_tabs.email")}
				fullWidth
				value={formValues.email}
				required
				error={Boolean(formErrors && formErrors.email)}
				helperText={
					formErrors && formErrors.email
						? formErrors && formErrors.email
						: null
				}
				onChange={(e) => onChangeField("email", e.target.value)}
			/>
		</>
	);
});
