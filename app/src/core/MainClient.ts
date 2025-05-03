import CatchErrors from "@core/CatchErrors";
import ProfilesController from "@core/controllers/ProfilesController";
import MainApi from "@core/MainApi";
import Request from "@core/Request";
import Socket from "@core/socket/Socket";
import Logger from "@service/Logger";

const logger = Logger.init();

/**
 * Класс, считающийся ядром бизнес логики на стороне клиента. 
 * Именно здесь происходит инициализация всех основных классов и вспомогательных сущностей.
 */
export default class MainClient {
	private readonly _request: Request;
	private readonly _catchErrors: CatchErrors;
	private readonly _profilesController: ProfilesController;
	private readonly _mainApi: MainApi;
	private readonly _socket: Socket;

	constructor() {
		logger.debug("init");

		this._catchErrors = new CatchErrors();
		this._request = new Request(this._catchErrors);

		this._profilesController = new ProfilesController(this._request);

		this._socket = new Socket(this._profilesController);
		this._mainApi = new MainApi(this._request, this._profilesController, this._socket);
	}

	get mainApi() {
		return this._mainApi;
	}

	// Получить профиль пользователя по id
	getProfile(userId?: string) {
		return this._profilesController.getProfile(userId);
	}

	/**
	 * Удаляем профиль своего пользователя.
	 * Это возможно только, если в запросе вернулся 401 статус и пользователя перекинуло на страницу входа.
	 * Где также, он может перейти на страницу регистрации.
	 * При этом, условие проверки существования this и ProfilesController обязательно, так как его может не быть при
	 * первом входе на страницу входа/регистрации (еще не до конца инициализировался конструктор класса MainClient).
	 */
	removeProfile() {
		if (this && this._profilesController) {
			this._profilesController.removeProfile();
		}
	}

	// Скачать файл с логами
	downloadLogFile() {
		logger.downloadToFile();
	}
}
