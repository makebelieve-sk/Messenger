import { PayloadAction } from "@reduxjs/toolkit";
import { IPhoto } from "../../types/models.types";
import { UserType } from "./slice";

export default {
    setPhotosCount: (state: UserType, action: PayloadAction<number>) => {
        state.photosCount = action.payload;
    },
    addPhotos: (state: UserType, action: PayloadAction<IPhoto[]>) => {
        state.photos = [ ...state.photos, ...action.payload ];
    },
    setPhotos: (state: UserType, action: PayloadAction<IPhoto[]>) => {
        state.photos = action.payload;
    },
    deletePhoto: (state: UserType, action: PayloadAction<number>) => {
        state.photos.splice(action.payload, 1);
    },
};