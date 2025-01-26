import EventEmitter from "eventemitter3";

import Logger from "@service/Logger";
import CatchErrors from "@core/CatchErrors";
import Request from "@core/Request";
import Socket from "@core/socket/Socket";
import ProfilesController from "@core/controllers/ProfilesController";
import { Profile } from "@core/models/Profile";
import MainApi from "@core/MainApi";
import { setAuth } from "@store/main/slice";
import { Pages } from "@custom-types/enums";
import { AppDispatch } from "@custom-types/redux.types";
import { MainClientEvents } from "@custom-types/events";
import { MY_ID } from "@utils/constants";

const logger = Logger.init();

// Класс, считающийся ядром бизнес логики на стороне клиента. Именно здесь происходит инициализация всех основных классов и вспомогательных сущностей
export default class MainClient extends EventEmitter {
    private readonly _request: Request;
    private readonly _catchErrors: CatchErrors;
    private readonly _profilesController: ProfilesController;
    private readonly _mainApi: MainApi;
    private readonly _socket: Socket;

    constructor(private readonly _dispatch: AppDispatch) {
        super();

        logger.debug("init");

        this._catchErrors = new CatchErrors(this._dispatch);
        this._request = new Request(this._catchErrors);

        this._profilesController = new ProfilesController(this._request, this._dispatch);
        
        this._socket = new Socket(this._dispatch);
        this._mainApi = new MainApi(this._request, this._dispatch);

        this._bindCatchErrorsListeners();
        this._bindProfileListeners();
        this._bindSocketListeners();
        this._bindMainApiListeners();
    }

    get mainApi() {
        return this._mainApi;
    }

    catchErrors(error: string) {
        this._catchErrors.catch(error);
    }

    getProfile(userId: string = MY_ID, showError: boolean = true) {
        return this._profilesController.getProfile(userId, showError) as Profile;
    }

    // Скачать файл с логами
    downloadLogFile() {
        logger.downloadToFile();
    }

    // Слушатели событый класса CatchErrors
    private _bindCatchErrorsListeners() {
        this._catchErrors.on(MainClientEvents.REDIRECT, (path: string) => {
            logger.debug(`MainClientEvents.REDIRECT: [path=${path}]`);
            this.emit(MainClientEvents.REDIRECT, path);
        });
    }

    // Слушатели событый класса ProfilesController
    private _bindProfileListeners() {
        this._profilesController.on(MainClientEvents.GET_ME, () => {
            logger.debug("MainClientEvents.GET_ME");
            this._getMe();
        });

        this._profilesController.on(MainClientEvents.ERROR, (error: string) => {
            logger.debug(`MainClientEvents.ERROR: [error=${error}]`);
            this.catchErrors(error);
        });
    }

    // Слушатели событый класса Socket
    private _bindSocketListeners() {
        this._socket.on(MainClientEvents.REDIRECT, (path: string) => {
            logger.debug(`MainClientEvents.REDIRECT: [path=${path}]`);
            this.emit(MainClientEvents.REDIRECT, path);
        });

        this._socket.on(MainClientEvents.ERROR, (error: string) => {
            logger.debug(`MainClientEvents.ERROR: [error=${error}]`);
            this.catchErrors(error);
        });
    }

    // Слушатели событый класса MainApi
    private _bindMainApiListeners() {
        this._mainApi.on(MainClientEvents.SIGN_IN, () => {
            logger.debug("MainClientEvents.SIGN_IN");

            // Необходимо обновить информацию о себе, так как после входа/регистрации информации о себе нет
            // Но при этом, уже созданы сущности "Профиль" и "Пользователь"
            // Если профиля не существует (только после выхода и без перезагрузки страницы, так как профиль удаляется только в этом случае), то необходимо заново его создать
            const myProfile = this.getProfile(MY_ID, false);

            myProfile
                ? myProfile.user.updateMe()
                : this._profilesController.addProfile();
        });

        this._mainApi.on(MainClientEvents.LOG_OUT, () => {
            logger.debug("MainClientEvents.LOG_OUT");

            this.emit(MainClientEvents.REDIRECT, Pages.signIn);
            this._dispatch(setAuth(false));
            this._socket.disconnect();
            this._profilesController.removeProfile();
        });
    }

    // Получили информацию о себе
    private _getMe() {
        this._dispatch(setAuth(true));
        this._initSocket();
        this._redirectHandler();
    }

    // Инициализация сокета
    private _initSocket() {
        logger.debug("_initSocket");

        const userInstance = this.getProfile().user;
        this._socket.init(userInstance.user);
    }

    // Редирект в зависимости от текущего урла
    private _redirectHandler() {
        switch (window.location.pathname) {
            case Pages.main:
            case Pages.signIn:
            case Pages.signUp:
                this.emit(MainClientEvents.REDIRECT, Pages.profile);
                break;
        }
    }
}