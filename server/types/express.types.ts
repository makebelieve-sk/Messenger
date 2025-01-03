import { Request } from "express";

export interface IRequestWithSharpedAvatar extends Request {
    sharpedAvatarUrl: string;
    sharpedPhotoUrl: string;
};

export interface IRequestWithShapedImages extends Request {
    sharpedImageUrls: string[];
};