import { ApiRoutes } from "common-types";

import { type Photos } from "@core/models/Photos";
import type Request from "@core/Request";
import Logger from "@service/Logger";
import useImagesCarouselStore from "@store/images-carousel";
import usePhotosStore from "@store/photos";
import useUIStore from "@store/ui";
import { type IPhoto } from "@custom-types/models.types";
import { PHOTOS_LIMIT } from "@utils/constants";

const logger = Logger.init("PhotosService");

/**
 * Класс, реализовывающий сущность "Фотографии" согласно контракту "Фотографии".
 * Важно: Мы не просто так дублируем фотографии здесь в сервисе и в состоянии Zustand.
 * Это необходимо для того, чтобы при переходе на страницу "Фотографии" другого пользователя
 * мы могли сохранить его фотографии здесь (этот сервис создается для каждого пользователя). 
 * А при возврате на страницу со своими фотографиями мы могли не давать новый запрос на повторное 
 * получение своих, ранее загруженных, фотографий.
 */
export default class PhotosService implements Photos {
	private _photos: IPhoto[] = [];
	private _hasMore = true;
	private _count = 0;

	constructor(private readonly _request: Request, private readonly _userId: string) {
		logger.debug("init");
	}

	get photos() {
		return this._photos;
	}

	get count() {
		return this._count;
	}

	// Получение всех фотографий на странице фотографий
	getAllPhotos(resolve?: () => void) {
		// На всякий случай добавляем ограничение на запрос, если получили все фотографии
		if (!this._hasMore) {
			this._syncStorePhotos();
			return;
		}

		// Получаем последнюю дату загрузки текущих загруженных фотографий, чтобы запросить следующие фотографии
		const lastCreatedDate = this._photos[this._photos.length - 1]
			? this._photos[this._photos.length - 1].createdAt
			: null;

		this._request.post({
			route: ApiRoutes.getPhotos,
			data: { userId: this._userId, lastCreatedDate, limit: PHOTOS_LIMIT },
			setLoading: (isLoading: boolean) => {
				usePhotosStore.getState().setPhotosLoading(isLoading);
			},
			successCb: ({ photos, count }: { success: boolean; photos: IPhoto[]; count: number; }) => {
				this._count = count;
				this._photos.push(...photos);
				this._hasMore = this._photos.length < count;

				logger.debug(`get all photos [current count: ${this._photos.length}, all count: ${count}]`);

				this._syncStorePhotos();
				resolve?.();
			},
		});
	}

	// Клик по фотографии
	onClickPhoto(photoId: string) {
		const photoIndex = this._photos.findIndex(p => p.id === photoId);

		if (this._photos && this._photos.length && photoIndex > -1) {
			useImagesCarouselStore.getState().setIndex(photoIndex);
		}
	};

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
	deletePhoto(data: { photoId: string; imageUrl: string; isAvatar: boolean; }, fromProfile = false) {
		this._request.post({
			route: ApiRoutes.deletePhoto,
			data,
			successCb: () => {
				const index = this._photos.findIndex(photo => photo.id === data.photoId);

				if (index === -1) {
					useUIStore.getState().setError("Произошла ошибка при удалении фотографии. Фотография не найдена.");
					return;
				}
				this._photos = this._photos.filter(photo => photo.id !== data.photoId);
				this._count -= 1;

				/**
				 * Условие специально для удаления фотографии.
				 * Если фотографий сейчас в сервисе меньше, чем пагинация (PHOTOS_LIMIT), фотографии есть еще в базе данных 
				 * и удаление фотографии произошло на странице "Профиль", то подгружаем следующую страницу с фотографиями 
				 * для отрисовки.
				 * Иначе, означает, что мы удаляем фотографию на странице "Фотографии", поэтому не подгружаем следующую 
				 * страницу потому, что на странице используется виртуальный скролл, который сработает автоматически 
				 * при изменении фотографий и сам подгрузит следующую страницу.
				 */
				if (this._photos.length < PHOTOS_LIMIT && this._hasMore && fromProfile) {
					this.getAllPhotos();
				} else {
					this._syncStorePhotos();
				}
			},
		});
	}

	// Синхронизация фотографий сервиса и глобального состояния
	private _syncStorePhotos() {
		usePhotosStore.getState().syncPhotos({
			photos: this._photos,
			count: this._count,
			hasMore: this._hasMore,
		});
	}
};