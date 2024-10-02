import { Request } from "express";

export interface IRequestWithParams extends Request {
    goNext?: boolean;
    dublicateToPhotoFile?: boolean;
};

export interface IRequestWithSharpData extends IRequestWithParams {
    sharpImageUrl: string;
    dublicateSharpImageUrl: string;
};

export interface IRequestWithImagesSharpData extends Request {
    sharpImagesUrls: string[];
};