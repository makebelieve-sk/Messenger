import { memo } from "react";

import Contacts from "@modules/edit/contacts/contacts";
import Main from "@modules/edit/main";
import type { IFormErrors, IFormValues } from "@pages/Edit";
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

// Точка входа в раздел редактирования. Содержит в себе обе вкладки формы редактирования.
export default memo(function EditTabsModule({ tab, formValues, formErrors, onChange }: IEditTabsModule) {
	const TabComponent = TabComponents[tab];

	return <div role="tabpanel" id={`vertical-tabpanel-${tab}`} aria-labelledby={`vertical-tab-${tab}`}>
		<TabComponent formValues={formValues} formErrors={formErrors} onChange={onChange} />
	</div>;
});
