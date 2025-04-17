import { ChangeEvent, memo } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import { type ITabModule } from "@modules/edit";
import DatePickerComponent from "@modules/edit/date-picker";
import i18next from "@service/i18n";

import "./main.scss";

enum SELECT_MALE {
	EMPTY = "notSelected",
	MALE = "male",
	FEMALE = "female",
};

// Компонент основной главной вкладки раздела редактирования
export default memo(function Main({ formValues, formErrors, onChange }: ITabModule) {
	return <>
		<TextField
			id="name"
			name="name"
			margin="normal"
			variant="outlined"
			label={i18next.t("edit_tabs.name")}
			autoComplete={i18next.t("edit_tabs.name")}
			fullWidth
			value={formValues.name}
			required
			autoFocus
			error={Boolean(formErrors?.name)}
			helperText={formErrors && formErrors.name ? formErrors.name : null}
			onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("name", e.target.value)}
		/>

		<TextField
			id="surName"
			name="surName"
			margin="normal"
			variant="outlined"
			label={i18next.t("edit_tabs.surname")}
			autoComplete={i18next.t("edit_tabs.surname")}
			fullWidth
			value={formValues.surName}
			required
			error={Boolean(formErrors?.surName)}
			helperText={formErrors && formErrors.surName ? formErrors.surName : null}
			onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("surName", e.target.value)}
		/>

		<FormControl fullWidth className={"edit-container__sex-select"}>
			<InputLabel id="sex-input">{i18next.t("edit_tabs.sex")}</InputLabel>

			<Select
				labelId="sex-input"
				id="sex-select"
				value={formValues.sex || SELECT_MALE.EMPTY}
				label={i18next.t("edit_tabs.sex")}
				onChange={(e: SelectChangeEvent<string>) => onChange("sex", e.target.value === SELECT_MALE.EMPTY ? null : e.target.value)}
			>
				<MenuItem value={SELECT_MALE.EMPTY}>
					{i18next.t("edit_tabs.select_sex.label_not_specified")}
				</MenuItem>

				<MenuItem value={SELECT_MALE.MALE}>
					{i18next.t("edit_tabs.select_sex.label_male")}
				</MenuItem>

				<MenuItem value={SELECT_MALE.FEMALE}>
					{i18next.t("edit_tabs.select_sex.label_female")}
				</MenuItem>
			</Select>
		</FormControl>

		<DatePickerComponent formValues={formValues} onChangeField={onChange} />

		<TextField
			id="work"
			name="work"
			margin="normal"
			variant="outlined"
			label={i18next.t("edit_tabs.work")}
			autoComplete={i18next.t("edit_tabs.work")}
			fullWidth
			value={formValues.work}
			className={"edit-container__work"}
			onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("work", e.target.value)}
		/>
	</>;
});
