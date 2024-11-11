import { Request } from "express";

export interface IRequestWithSharpData extends Request {
    sharpImageUrl: string;
    dublicateSharpImageUrl: string;
};

export interface IRequestWithImagesSharpData extends Request {
    sharpImagesUrls: string[];
};