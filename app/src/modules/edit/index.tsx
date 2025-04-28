import { memo } from "react";

import Contacts from "@modules/edit/contacts";
import Main from "@modules/edit/main";
import { IFormErrors, IFormValues } from "@pages/Edit";
import { EditTabs } from "@custom-types/enums";

interface IEditTabsModule extends ITabModule {
	tab: number;
};

export interface ITabModule {
	formValues: IFormValues;
	formErrors: IFormErrors | null;
	onChange: (field: string, value: string | null) => void;
};

const TabComponents = {
	[EditTabs.MAIN]: Main,
	[EditTabs.CONTACTS]: Contacts,
};

export default memo(function EditTabsModule({ tab, formValues, formErrors, onChange }: IEditTabsModule) {
	const TabComponent = TabComponents[tab];

	return <div
		role="tabpanel"
		id={`vertical-tabpanel-${tab}`}
		aria-labelledby={`vertical-tab-${tab}`}
	>
		<TabComponent
			formValues={formValues}
			formErrors={formErrors}
			onChange={onChange}
		/>
	</div>
});