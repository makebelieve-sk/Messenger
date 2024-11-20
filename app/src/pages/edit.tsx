import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { LoadingButton } from "@mui/lab";
import dayjs, { Dayjs } from "dayjs";
import EditTabsModule from "../components/edit-tabs-module";
import AlertComponent from "../components/Common/Alert";
import { ApiRoutes } from "../types/enums";
import { IUser, IUserDetails } from "../types/models.types";
import Request from "../core/Request";
import { selectUserState, setUser, setUserDetail } from "../state/user/slice";
import { useAppDispatch, useAppSelector } from "../hooks/useGlobalState";
import CatchErrors from "../core/CatchErrors";
import { REQUIRED_FIELD } from "../utils/constants";
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
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [formValues, setFormValues] = useState<IFormValues | null>(null);
    const [formErrors, setFormErrors] = useState<IFormErrors | null>({});
    const [saveDisabled, setSaveDisabled] = useState(false);

    const { user, userDetail } = useAppSelector(selectUserState);

    const dispatch = useAppDispatch();
    const catchErrors = new CatchErrors(dispatch);
    const request = new Request(catchErrors);

    // Установка disabled кнопке "Сохранить"
   useEffect(() => {
        setSaveDisabled(loading || Boolean(formErrors && Object.values(formErrors).some(Boolean)));
    }, [loading, formValues]);

    // Получаем детальную информацию о пользователе
    useEffect(() => {
        if (!userDetail && user) {
            request.post({ route: ApiRoutes.getUserDetail,
                data: { userId: user.id },
                successCb:(data: { success: boolean, userDetail: IUserDetails }) => dispatch(setUserDetail(data.userDetail ? data.userDetail : null)),
                failedCb: (error: any) => catchErrors.catch(error)
        });
        }
    }, [user]);

    useEffect(() => {
        if (user && userDetail) {
            setFormValues({
                name: user.firstName,
                surName: user.thirdName,
                sex: userDetail.sex,
                birthday: userDetail.birthday ? userDetail.birthday : "2000-01-01",
                work: userDetail.work,
                city: userDetail.city,
                phone: user.phone,
                email: user.email,
            });
        }
    }, [user, userDetail]);

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

            if (user && formValues && !saveDisabled) {
                const result = {
                    ...formValues,
                    userId: user.id
                };

                if (result["birthday"] && typeof result["birthday"] !== "string") {
                    result["birthday"] = (result["birthday"] as dayjs.Dayjs).format("YYYY-MM-DD");
                }

                request.post({
                    route: ApiRoutes.editInfo,
                    data: result,
                     setLoading,
                    successCb:
                    (data: { success: boolean, user: IUser, userDetails: IUserDetails }) => {
                        if (data.success) {
                            dispatch(setUser(data.user));
                            dispatch(setUserDetail(data.userDetails));
                            setShowAlert(true);
                        }
                    },
                    failedCb: (error: any) => catchErrors.catch(error)
            });
            } else {
                throw new Error("Нет пользователя");
            }
        } catch (error) {
            setLoading(false);
            catchErrors.catch("Произошла ошибка при изменении информации о пользователе: " + error);
        }
    };

    return <Paper className={"edit-container"}>
        <Tabs
            orientation="vertical"
            value={tab}
            onChange={onChangeTab}
            aria-label="Edit tabs"
            className={"edit-container__tabs"}
        >
            <Tab label="Основное" id="main" aria-controls="main" disabled={loading} className={"edit-container__tab-name"} />
            <Tab label="Контакты" id="contacts" aria-controls="contacts" disabled={loading} className={"edit-container__tab-name"} />
        </Tabs>

        <div className={"edit-container__module"}>
            {user && userDetail && formValues
                ? <Box component="form" noValidate onSubmit={onSubmit}>
                    <EditTabsModule tab={tab} formValues={formValues} formErrors={formErrors} onChange={onChange} />

                    <LoadingButton
                        fullWidth
                        type="submit"
                        variant="contained"
                        className={"edit-container__module__loading-button"}
                        loading={loading}
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
                : <div className={"edit-container__module__spinner"}><CircularProgress /></div>
            }
        </div>
    </Paper>
};