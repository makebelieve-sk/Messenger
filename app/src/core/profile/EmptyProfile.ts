import Request from "../Request";
import Profile from "./Profile";
import { AppDispatch } from "../../types/redux.types";

export default class EmptyProfile extends Profile {
    constructor(...args: [string, Request, AppDispatch]) {
        super(...args);
    }
}