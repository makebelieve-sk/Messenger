//поля с геттерами

import EventEmitter from "eventemitter3";
import Request from "../Request";
import { IUserDetails } from "../../types/models.types";
import { ApiRoutes } from "../../types/enums";
import { setLoadingUserDetails } from "../../state/main/slice";
import { AppDispatch } from "../../types/redux.types";
import { UserDetailsEvents } from "../../types/events";

export default class UserDetails extends EventEmitter {
    private _details: IUserDetails | null = null

    constructor(private readonly _request: Request, private readonly _dispatch: AppDispatch) {
        super()
        // this._getUserDetails()
        this._getUserDetail()
    }

    get sex() {
        return this._details?.sex || ""
    }
    set sex(value: string) {
        if (this._details) {
            this._details.sex = value
        }
    }
    get birthday() {
        return this._details?.birthday || "1970-01-01"
    }
    get city() {
        return this._details?.city || ""
    }
    get work() {
        return this._details?.work || ""
    }

    updateDetails(details: IUserDetails) {
        this._details = details
        console.log(this._details);

    }

    private _getUserDetail() {
        this._request.get({
            route: ApiRoutes.getUserDetail,
            setLoading: (isLoading: boolean) => this._dispatch(setLoadingUserDetails(isLoading)),
            successCb: (data: { success: boolean, userDetail: IUserDetails }) => {
                this._details = data.userDetail
                this.emit(UserDetailsEvents.UPDATE)
            }
        });
    }
}