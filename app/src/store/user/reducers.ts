import { PayloadAction } from "@reduxjs/toolkit";

import { IPhoto } from "@custom-types/models.types";
import { UserStateType } from "@custom-types/redux.types";

export default {
    setPhotosCount: (state: UserStateType, action: PayloadAction<number>) => {
        state.photosCount = action.payload;
    },
    addPhotos: (state: UserStateType, action: PayloadAction<IPhoto[]>) => {
        state.photos = [ ...state.photos, ...action.payload ];
    },
    setPhotos: (state: UserStateType, action: PayloadAction<IPhoto[]>) => {
        state.photos = action.payload;
    },
    deletePhoto: (state: UserStateType, action: PayloadAction<number>) => {
        state.photos.splice(action.payload, 1);
    }
};