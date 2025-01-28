import { memo } from "react";
import { Dayjs } from "dayjs";
import TextField from "@mui/material/TextField";
import DatePickerComponent from "../date-picker";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useTranslation } from "react-i18next";

import { ITabModule } from "@modules/edit";

import "./main.scss";

export default memo(function Main({
	formValues,
	formErrors,
	onChange,
}: ITabModule) {
	const { t } = useTranslation();

	const onChangeField = (
		field: string,
		value: string | boolean | Date | null | Dayjs
	) => {
		onChange(field, value);
	};

	return (
		<>
			<TextField
				id="name"
				name="name"
				margin="normal"
				variant="outlined"
				label={t("edit_tabs.name")}
				autoComplete={t("edit_tabs.name")}
				fullWidth
				value={formValues.name}
				required
				autoFocus
				error={Boolean(formErrors && formErrors.name)}
				helperText={
					formErrors && formErrors.name ? formErrors.name : null
				}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeField("name", e.target.value)}
			/>

			<TextField
				id="surName"
				name="surName"
				margin="normal"
				variant="outlined"
				label={t("edit_tabs.surname")}
				autoComplete={t("edit_tabs.surname")}
				fullWidth
				value={formValues.surName}
				required
				error={Boolean(formErrors && formErrors.surName)}
				helperText={
					formErrors && formErrors.surName
						? formErrors && formErrors.surName
						: null
				}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeField("surName", e.target.value)}
			/>

			<FormControl fullWidth className={"edit-container__sex-select"}>
				<InputLabel id="sex-input">Пол</InputLabel>
				<Select
					labelId="sex-input"
					id="sex-select"
					value={formValues.sex}
					label={t("edit_tabs.sex")}
					onChange={(e: SelectChangeEvent<string>) => onChangeField("sex", e.target.value)}
				>
					<MenuItem value="">
						{t("edit_tabs.sex_not_specified")}
					</MenuItem>
					<MenuItem value={t("edit_tabs.sex_male")}>
						{t("edit_tabs.sex_male")}
					</MenuItem>
					<MenuItem value={t("edit_tabs.sex_female")}>
						{t("edit_tabs.sex_female")}
					</MenuItem>
				</Select>
			</FormControl>

			<DatePickerComponent
				formValues={formValues}
				onChangeField={onChangeField}
			/>

			<TextField
				id="work"
				name="work"
				margin="normal"
				variant="outlined"
				label={t("edit_tabs.work")}
				autoComplete={t("edit_tabs.work")}
				fullWidth
				value={formValues.work}
				className={"edit-container__work"}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeField("work", e.target.value)}
			/>
		</>
	);
});
