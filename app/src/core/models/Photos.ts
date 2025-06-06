import { type IPhoto } from "@custom-types/models.types";

// Контракт модели "Фотографии"
export interface Photos {
	photos: IPhoto[];
	count: number;

	getAllPhotos: (resolve?: () => void) => void;
	onClickPhoto: (photoId: string) => void;
	addPhotoFromAvatar: (photo: IPhoto) => void;
	addPhotos: (data: FormData) => void;
	deletePhoto: (data: { photoId: string; imageUrl: string; isAvatar: boolean; }, fromProfile?: boolean) => void;
};