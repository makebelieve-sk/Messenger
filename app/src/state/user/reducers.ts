import { PayloadAction } from "@reduxjs/toolkit";
import { IPhoto, IUser, IUserDetails } from "../../types/models.types";
import { UserType } from "./slice";

export default {
    setUser: (state: UserType, action: PayloadAction<IUser>) => {
        state.user = action.payload;
    },
    setUserDetail: (state: UserType, action: PayloadAction<IUserDetails | null>) => {
        state.userDetail = action.payload;
    },
    changeUserField: (state: UserType, action: PayloadAction<{ field: string; value: string; }>) => {
        const { field, value } = action.payload;
        if (state.user) state.user[field] = value;
    },
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