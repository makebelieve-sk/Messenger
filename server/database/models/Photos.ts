import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IPhoto } from "../../types/models.types";

interface IConstructor {
    sequelize: Sequelize;
};

// Тип модели Photos, унаследованного от Sequelize
export type PhotosInstance = IPhoto & Model & {};

export default class Photos {
    private _sequelize: Sequelize;
    private _photosModel: ModelStatic<PhotosInstance> | undefined = undefined;

    constructor({ sequelize }: IConstructor) {
        this._sequelize = sequelize;
        this._init();
    }

    get photos() {
        return this._photosModel as ModelStatic<PhotosInstance>;
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
            }
        })
    }
}