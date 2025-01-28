import EventEmitter from "eventemitter3";
import { Dispatch, SetStateAction } from "react";
import dayjs from "dayjs";

import { User } from "@core/models/User";
import { IFormValues } from "@pages/Edit";
import { IPhoto } from "@custom-types/models.types";

// Контракт модели "Профиль пользователя"
export interface Profile extends EventEmitter {
    user: User;

    onClickAvatar: () => void;
    onDeleteAvatar: (setLoading?: Dispatch<SetStateAction<boolean>>) => void;
    onSetAvatar: (newAvatar: { id: string; newAvatarUrl: string; newPhotoUrl: string; }) => void;
    getAllPhotos: (setLoading: Dispatch<SetStateAction<boolean>>) => void;
    updatePhotosCount: (count: number) => void;
    onClickPhoto: (photos: IPhoto[], index: number) => void;
    addPhotos: (data: Object, setLoading: Dispatch<SetStateAction<boolean>>) => void;
    deletePhoto: (data: Object, photos: IPhoto[], path: string) => void;
    getFriends: (setLoading: Dispatch<SetStateAction<boolean>>) => void;
    editInfo: ( result: IFormValues) => void;
}