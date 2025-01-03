import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";

import Status from "./status";
import Buttons from "./buttons";
import Spinner from "../../Common/Spinner";
import { useAppSelector } from "../../../hooks/useGlobalState";
import useWebRTC from "../../../hooks/useWebRTC";
import { selectCallsState } from "../../../state/calls/slice";
import { CallStatus } from "../../../types/enums";
import { NO_PHOTO } from "../../../utils/constants";

import "./modal-with-call.scss";

export default function ModalWithCall() {
    const [open, setOpen] = React.useState(false);
    
    const { visible, status, chatInfo } = useAppSelector(selectCallsState);

    const {
        LOCAL_VIDEO,
        clients,
        settings,
        layout,
        onAccept,
        onToggle,
        onEnd,
        provideMediaRef,
    } = useWebRTC();

    // Открываем модальное окно только, если есть исходящий/входящий звонок 
    React.useEffect(() => {
        setOpen(Boolean(visible && status !== CallStatus.NOT_CALL));
    }, [visible, status]);

    return <Dialog fullWidth maxWidth="xl" open={open}>
        <DialogContent className="call-container">
            {chatInfo && status
                ? <div className="call-container__content-block">
                    {/* Статус звонка */}
                    <div className="call-container__content-block__text">
                        <span>{chatInfo.chatName}</span>
                        <Status status={status} type={chatInfo.chatSettings.video ? "Видеозвонок" : "Аудиозвонок"} />
                    </div>

                    {/* Контент */}
                    <div className="call-container__main">
                        {clients && clients.length
                            ? <div className="call-container__main__video">
                                {clients
                                    .sort((a, b) => a.peerId === LOCAL_VIDEO ? -1 : b.peerId === LOCAL_VIDEO ? 1 : 0)
                                    .map((client, index) => {
                                        const { peerId, avatarUrl, name, audio, video, isTalking } = client;
                                        const classNameIsTalking = isTalking ? "is-talking" : "";

                                        return <div
                                            key={peerId}
                                            id={peerId}
                                            className="call-container__main__video__item"
                                            style={layout[index]}
                                        >
                                            <div className={`"call-container__main__video__item__video-wrapper" ${classNameIsTalking}`}>
                                                <video
                                                    ref={instance => { provideMediaRef(peerId, instance) }}
                                                    autoPlay
                                                    muted={peerId === LOCAL_VIDEO}
                                                />
                                            </div>

                                            {video
                                                ? null
                                                : <div className={`$"call-container__main__video__item__img-wrapper"]} ${classNameIsTalking}`}>
                                                    <img alt={name} src={avatarUrl ? avatarUrl : NO_PHOTO} />
                                                </div>
                                            }

                                            <div className="call-container__main__video__item__help-text">
                                                {!audio
                                                    ? <div className="call-container__main__video__item__help-text__no-micro">
                                                        <MicOffOutlinedIcon fontSize="small" color="error" />
                                                    </div>
                                                    : null
                                                }
                                                <div>
                                                    {peerId === LOCAL_VIDEO
                                                        ? "Вы"
                                                        : name && name.length > 30 ? name.slice(0, 30) + "..." : name
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    })}
                            </div>
                            : <img
                                alt={chatInfo.chatName}
                                src={chatInfo.chatAvatar ? chatInfo.chatAvatar : NO_PHOTO}
                                className="call-container__main__img"
                            />
                        }
                    </div>

                    {/* Кнопки действий звонка */}
                    <div className="call-container__buttons-block">
                        <Buttons
                            status={status}
                            settings={settings}
                            visibleVideo={Boolean(chatInfo.chatSettings.video)}
                            onAccept={onAccept}
                            onToggle={onToggle}
                            onEnd={onEnd}
                        />
                    </div>
                </div>
                : <Spinner />
            }
        </DialogContent>
    </Dialog>
};