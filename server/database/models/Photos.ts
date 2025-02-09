import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IPhoto } from "@custom-types/models.types";

// Тип модели Photos, унаследованного от Sequelize
export type PhotosInstance = IPhoto & Model & {};

export default class Photos {
    private _photosModel!: ModelStatic<PhotosInstance>;

    constructor(private readonly _sequelize: Sequelize) {
        this._init();
    }

    get photos() {
        return this._photosModel;
    }

    private _init() {
        this._photosModel = this._sequelize.define<PhotosInstance, IPhoto>("Photos", {
            id: {
                type: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUIDV4,
                allowNull: false,
                field: "user_id"
            },
            path: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            createDate: {
                type: DataTypes.DATE,
                allowNull: false,
                field: "create_date"
            }
        })
    }
}