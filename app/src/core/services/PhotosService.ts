import { type Photos } from "@core/models/Photos";
import type Request from "@core/Request";
import Logger from "@service/Logger";
import usePhotosStore from "@store/photos";
import { ApiRoutes } from "@custom-types/enums";
import { type IPhoto } from "@custom-types/models.types";
import { PHOTOS_LIMIT } from "@utils/constants";

const logger = Logger.init("PhotosService");

// Класс, реализовывающий сущность "Фотографии" согласно контракту "Фотографии"
export default class PhotosService implements Photos {
	private _photos: IPhoto[] = [];
	private _haveAll = false;
	private _count = 0;
	private _page = 0;

	constructor(private readonly _request: Request, private readonly _userId: string) {
		logger.debug("init");
	}

	get photos() {
		return this._photos;
	}

	// Получение всех фотографий на странице фотографий
	getAllPhotos(page: number = 1) {
		this._page = page;

		// Даем запрос на получение всех фотографий только при условии, что все фотографии не загружены
		if (!this._haveAll) {
			this._request.post({
				route: ApiRoutes.getPhotos,
				data: { userId: this._userId, limit: PHOTOS_LIMIT, offset: this._photos.length },
				setLoading: (isLoading: boolean) => {
					usePhotosStore.getState().setPhotosLoading(isLoading);
				},
				successCb: ({ photos, count }: { success: boolean; photos: IPhoto[]; count: number; }) => {
					this._count = count;
					this._photos.push(...photos);
					this._page++;

					// Если кол-во фотографий на клиенте совпадает с кол-вом фотографий из БД, то значит, что получили все фотографии текущего профиля
					if (this._photos.length === count) {
						this._haveAll = true;
					}

					logger.debug(`get all photos [current count: ${this._photos.length}, all count: ${count}]`);

					this._syncStorePhotos();
				},
			});
		} else {
			// Отдаем все фотографии, потому что они уже загружены
			// TODO на фронте реализовать бесконечный скролл, который будет отрисовывать только текущие 25 фотографий.
			// Этот класс будет содержать вообще все фото (в this._photos). Соот-но, в zustand отдаем только текущие 25 фоток.
			// Учесть еще syncPhotos в остальных местах здесь
			usePhotosStore.getState().syncPhotos({ 
				photos: this._photos.slice((this._page - 1) * PHOTOS_LIMIT, this._page * PHOTOS_LIMIT), 
				count: this._count, 
			});
		}
	}

	// Добавление новой фотографии в профиль пользователя после добавления аватара
	addPhotoFromAvatar(photo: IPhoto) {
		this._photos.unshift(photo);
		this._count += 1;

		this._syncStorePhotos();
	}

	// Добавление новых фотографий (одной или несколько)
	addPhotos(data: FormData) {
		this._request.post({
			route: ApiRoutes.savePhotos,
			data,
			setLoading: (isLoading: boolean) => {
				usePhotosStore.getState().setAddPhotosLoading(isLoading);
			},
			successCb: ({ photos }: { success: boolean; photos: IPhoto[]; }) => {
				this._photos = photos.concat(this._photos);
				this._count += photos.length;

				this._syncStorePhotos();
			},
			config: { headers: { "Content-Type": "multipart/form-data" } },
		});
	}

	// Удаление фотографии
	deletePhoto(data: { photoId: string; imageUrl: string; isAvatar: boolean; }) {
		this._request.post({
			route: ApiRoutes.deletePhoto,
			data,
			successCb: () => {
				const index = this._photos.findIndex(photo => photo.id === data.photoId);

				if (index !== -1) {
					this._photos.splice(index, 1);
				}

				this._count -= 1;

				this._syncStorePhotos();
			},
		});
	}

	// Синхронизация фотографий сервиса и стора
	private _syncStorePhotos() {
		/**
		 * Если фотографий сейчас в сервисе меньше, чем пагинация (25 фото), а также, фотографии есть еще в базе данных, 
		 * то подгружаем следующую страницу с фотографиями для отрисовки.
		 */
		if (this._photos.length < PHOTOS_LIMIT && !this._haveAll) {
			this.getAllPhotos();
		} else {
			usePhotosStore.getState().syncPhotos({ photos: this._photos, count: this._count });
		}
	}
}
