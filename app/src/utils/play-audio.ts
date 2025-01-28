// import { NextRouter } from "next/router";
// import Request from "../core/Request";
// import catchErrors from "../core/CatchErrors";
import { AppDispatch } from "@custom-types/redux.types";
// import { ApiRoutes } from "../types/enums";

export default class PlayAudio {
    // private _path: undefined | string = undefined;
    // private _dispatch: undefined | AppDispatch = undefined;
    private _isSoundNotification: boolean = false;
    private _chatId: undefined | string = undefined;

    constructor(_: string, __: AppDispatch, isSoundNotification: boolean, chatId: string) {
        // this._path = path;
        // this._dispatch = dispatch;
        this._isSoundNotification = isSoundNotification;
        this._chatId = chatId;
    };

    // Проверка на необходимость отправки запроса на сервер для звукового уведомления нового сообщения в чате
    public init() {
        if (this._isSoundNotification && this._chatId) {
            this._getChatSoundStatus();
        } else {
            this._play();
        }
    };

    // Запрос на получение статуса звукового уведомления чата
    private _getChatSoundStatus() {
        // Request.post(
        //     ApiRoutes.getChatSoundStatus,
        //     { chatId: this._chatId as string },
        //     undefined,
        //     (data: { success: boolean, chatSoundStatus: boolean }) => {
        //         // Если записи в БД нет -> звуковое уведомление чата включено
        //         if (!data.chatSoundStatus) {
        //             this._play();
        //         }
        //     },
        //     "Произошла ошибка при получении статуса звукового уведомления чата: "
        // );
    };

    // Воспроизведение аудио элемента
    private _play() {
        // new Audio(this._path)
        //     .play()
        //     .catch(error => {
        //         const errorText = "Произошла ошибка при проигрывании аудиофайла в момент получения нового сообщения: " + error;

        //         if (this._dispatch) {
        //             catchErrors.catch(
        //                 errorText,
        //                 this._dispatch
        //             )
        //         } else {
        //             console.log(errorText);
        //         }
        //     });
    };
};