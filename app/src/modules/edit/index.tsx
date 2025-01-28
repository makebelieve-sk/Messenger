import { memo } from "react";
import { Dayjs } from "dayjs";

import { IFormErrors, IFormValues } from "@pages/Edit";
import Contacts from "@modules/edit/contacts";
import Main from "@modules/edit/main";
import {EditTabs} from "@custom-types/enums";

interface IEditTabsModule extends ITabModule {
	tab: number;
}

export interface ITabModule {
	formValues: IFormValues;
	formErrors: IFormErrors | null;
	onChange: (
		field: string,
		value: string | boolean | Date | null | Dayjs
	) => void;
}

const Tabcomponents = {
	[EditTabs.MAIN]: Main,
	[EditTabs.CONTACTS]: Contacts,
};

export default memo(function EditTabsModule({
	tab,
	formValues,
	formErrors,
	onChange,
}: IEditTabsModule) {
	const Tabcomponent = Tabcomponents[tab];
	return <div
		role="tabpanel"
		id={`vertical-tabpanel-${tab}`}
		aria-labelledby={`vertical-tab-${tab}`}
	>
		<Tabcomponent
			formValues={formValues}
			formErrors={formErrors}
			onChange={onChange}
		/>
	</div>
});
