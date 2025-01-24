import { useContext, useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { LoadingButton } from "@mui/lab";
import dayjs, { Dayjs } from "dayjs";

import EditTabsModule from "../components/edit-tabs-module";
import AlertComponent from "../components/Common/Alert";
import { REQUIRED_FIELD } from "../utils/constants";
import { UserDetailsEvents } from "../types/events";
import useProfile from "../hooks/useProfile";
import useMainClient from "../hooks/useMainClient";
import SpinnerComponent from "../components/ui/Spinner";
import useUserDetails from "../hooks/useUserDetails";
import "../styles/pages/edit.scss";

export interface IFormValues {
    name: string;
    surName: string;
    sex: string;
    birthday: dayjs.Dayjs | string;
    work: string;
    city: string;
    phone: string;
    email: string;
};

export interface IFormErrors {
    name?: string;
    surName?: string;
    phone?: string;
    email?: string;
};

export default function Edit() {
    const [tab, setTab] = useState(0);
    const [loadingSaveBtn, setLoadingSaveBtn] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [formValues, setFormValues] = useState<IFormValues >({
        name: "",
        surName: "",
        sex: "",
        birthday: "",
        work: "",
        city: "",
        phone: "",
        email: "",
    } );
    const [formErrors, setFormErrors] = useState<IFormErrors | null>({});
    const [saveDisabled, setSaveDisabled] = useState(false);
    const [loading, setLoading] = useState(false)
 
    const mainClient =  useMainClient();
    const profile =  useProfile();
    const userDetails = useUserDetails();

    useEffect(() => {
        profile.user.userDetails.on(UserDetailsEvents.UPDATE, () => {
             setFormValues({

                name: profile.user.firstName,
                surName: profile.user.thirdName,
                sex: profile.user.userDetails.sex,
                birthday: profile.user.userDetails.birthday ,
                work: profile.user.userDetails.work,
                city: profile.user.userDetails.city,
                phone: profile.user.phone,
                email: profile.user.email,
            });
        })
    }, [])

    // Установка disabled кнопке "Сохранить"
   useEffect(() => {
        setSaveDisabled(loadingSaveBtn || Boolean(formErrors && Object.values(formErrors).some(Boolean)));
    }, [loadingSaveBtn, formValues]);

    const onChangeTab = (_: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
        setShowAlert(false);
    };

    const onChange = (field: string, value: string | boolean | Date | null | Dayjs) => {
        if (formValues) {
            setFormValues({
                ...formValues,
                [field]: value
            });

            if (["name", "surName", "phone", "email"].includes(field)) {
                setFormErrors({
                    [field]: value ? "" : REQUIRED_FIELD
                })
            }
        }
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();

            if ( formValues && !saveDisabled) {
                const result = {
                    ...formValues,
                    userId: profile.user.id
                };

                if (result["birthday"] && typeof result["birthday"] !== "string") {
                    result["birthday"] = (result["birthday"] as dayjs.Dayjs).format("YYYY-MM-DD");
                }

               profile.editInfo({result, setLoading: setLoadingSaveBtn, setShowAlert})

            } else {
                throw new Error("Нет пользователя");
            }
        } catch (error) {
            setLoadingSaveBtn(false);
            mainClient.catchErrors("Произошла ошибка при изменении информации о пользователе: " + error);
        }
    };

        const handleOnLoading = (isLoading: boolean) => setLoading(isLoading)
        
        //подписка на событие лоадинг
        useEffect(() => {
           userDetails.on(UserDetailsEvents.SET_LOADING, handleOnLoading)

            return  ()=>{
                userDetails.off(UserDetailsEvents.SET_LOADING, handleOnLoading)
            }
        }, [])
        
    return <Paper className={"edit-container"}>
        <Tabs
            orientation="vertical"
            value={tab}
            onChange={onChangeTab}
            aria-label="Edit tabs"
            className={"edit-container__tabs"}
        >
            <Tab label="Основное" id="main" aria-controls="main" disabled={loadingSaveBtn} className={"edit-container__tab-name"} />
            <Tab label="Контакты" id="contacts" aria-controls="contacts" disabled={loadingSaveBtn} className={"edit-container__tab-name"} />
        </Tabs>

        <div className={"edit-container__module"}>
                 <Box component="form" noValidate onSubmit={onSubmit}>
                    
                    {loading ? <SpinnerComponent/> :
                    <EditTabsModule tab={tab} formValues={formValues} formErrors={formErrors} onChange={onChange} />
                    }
                    <LoadingButton
                        fullWidth
                        type="submit"
                        variant="contained"
                        className={"edit-container__module__loading-button"}
                        loading={loadingSaveBtn}
                        disabled={saveDisabled}
                    >
                        Сохранить
                    </LoadingButton>

                    {showAlert
                        ? <AlertComponent show={showAlert}>
                            <><b>Изменения сохранены</b> - новые данные будут отражены на Вашей странице.</>
                        </AlertComponent>
                        : null
                    }
                </Box>
        </div>
    </Paper>
};