import { type IPhoto } from "@custom-types/models.types";

// Контракт модели "Фотографии"
export interface Photos {
	photos: IPhoto[];

	getAllPhotos: () => void;
	addPhotoFromAvatar: (photo: IPhoto) => void;
	addPhotos: (data: FormData) => void;
	deletePhoto: (data: { photoId: string; imageUrl: string; isAvatar: boolean; }) => void;
};
