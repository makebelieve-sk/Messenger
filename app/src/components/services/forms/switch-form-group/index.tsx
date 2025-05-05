import { type ChangeEvent, memo } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

import SwitchComponent from "@components/ui/switch";
import i18next from "@service/i18n";
import { type INotificationSettings } from "@custom-types/models.types";

interface ISwitchFormGroup {
    form: Omit<INotificationSettings, "userId">;
    onChange: (field: keyof Omit<INotificationSettings, "userId">, value: boolean) => void;
};

// Форма модального окна настроек пользователя
export default memo(function SwitchFormGroup({ form, onChange }: ISwitchFormGroup) {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.name as keyof Omit<INotificationSettings, "userId">, event.target.checked);
	};

	return <FormGroup className="settings-form">
		<FormControlLabel
			control={<SwitchComponent checked={form.soundEnabled} onChange={handleChange} name="soundEnabled" />}
			label={i18next.t("modals.soundEnabled")}
		/>
		<FormControlLabel
			control={<SwitchComponent checked={form.messageSound} onChange={handleChange} name="messageSound" />}
			label={i18next.t("modals.messageSound")}
		/>
		<FormControlLabel
			control={<SwitchComponent checked={form.friendRequestSound} onChange={handleChange} name="friendRequestSound" />}
			label={i18next.t("modals.friendRequestSound")}
		/>
	</FormGroup>;
});