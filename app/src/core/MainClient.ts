import EventEmitter from "eventemitter3";

import CatchErrors from "./CatchErrors";
import Request from "./Request";
import Socket from "./socket/Socket";
import ProfilesController from "./profile/ProfilesController";
import Profile from "./profile/Profile";
import MainApi from "./MainApi";
import { setAuth } from "../state/main/slice";
import { Pages } from "../types/enums";
import { AppDispatch } from "../types/redux.types";
import { MainClientEvents } from "../types/events";
import { MY_ID } from "../utils/constants";

// Класс, считающийся ядром бизнес логики на стороне клиента. Именно здесь происходит инициализация всех основных классов и вспомогательных сущностей
export default class MainClient extends EventEmitter {
    private readonly _request: Request;
    private readonly _catchErrors: CatchErrors;
    private readonly _profilesController: ProfilesController;
    private readonly _mainApi: MainApi;
    private readonly _socket: Socket;

    constructor(private readonly _dispatch: AppDispatch) {
        super();

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

    // TODO Удалить после рефакторинга звонков (useWebRTC)
    get socket() {
        return this._socket.socket;
    }

    catchErrors(error: string) {
        this._catchErrors.catch(error);
    }

    getProfile(userId: string = MY_ID): Profile {
        return this._profilesController.getProfile(userId);
    }

    // Слушатели событый класса CatchErrors
    private _bindCatchErrorsListeners() {
        this._catchErrors.on(MainClientEvents.REDIRECT, (path: string) => {
            this.emit(MainClientEvents.REDIRECT, path);
        });
    }

    // Слушатели событый класса ProfilesController
    private _bindProfileListeners() {
        this._profilesController.on(MainClientEvents.GET_ME, () => {
            this._getMe();
        });

        this._profilesController.on(MainClientEvents.ERROR, (error: string) => {
            this.catchErrors(error);
        });
    }

    // Слушатели событый класса Socket
    private _bindSocketListeners() {
        this._socket.on(MainClientEvents.REDIRECT, (path: string) => {
            this.emit(MainClientEvents.REDIRECT, path);
        });

        this._socket.on(MainClientEvents.ERROR, (error: string) => {
            this.catchErrors(error);
        });
    }

    // Слушатели событый класса MainApi
    private _bindMainApiListeners() {
        this._mainApi.on(MainClientEvents.SIGN_IN, () => {
            // Это условие необходимо для того, что если пользователь вышел, его профиль удалился и без обновления страницы вернется EmptyProfile
            if (this._profilesController.profiles.has(MY_ID)) {
                // Необходимо обновить информацию о себе, так как после входа/регистрации информации о себе нет
                // Но при этом, уже созданы сущности "Профиль" и "Пользователь" 
                const myProfile = this.getProfile();
                myProfile.user.updateMe();
            } else {
                this._profilesController.addProfile();
            }
        });

        this._mainApi.on(MainClientEvents.LOG_OUT, () => {
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
        const myUser = this.getProfile().user.user;
        this._socket.init(myUser);
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