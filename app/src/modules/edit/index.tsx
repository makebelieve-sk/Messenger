import React from "react";
import { Dayjs } from "dayjs";
import { IFormErrors, IFormValues } from "../../pages/edit";
import Contacts from "./contacts";
import Main from "./main";

interface IEditTabsModule extends ITabModule {
    tab: number;
};

export interface ITabModule {
    formValues: IFormValues;
    formErrors: IFormErrors | null;
    onChange: (field: string, value: string | boolean | Date | null | Dayjs) => void;
};

enum TAB_NUMBER {
    MAIN = 0,
    CONTACTS = 1
};

const Tabcomponents = {
    [TAB_NUMBER.MAIN]: Main,
    [TAB_NUMBER.CONTACTS]: Contacts
   }

export default React.memo(function EditTabsModule({ tab, formValues, formErrors, onChange }: IEditTabsModule) {
    const Tabcomponent = Tabcomponents[tab]
    return <div 
                role="tabpanel" 
                id={`vertical-tabpanel-${tab}`} 
                aria-labelledby={`vertical-tab-${tab}`}
            >
                <Tabcomponent formValues={formValues} formErrors={formErrors} onChange={onChange} />
            </div>;
});