import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { CallNames, CallTypes } from "../../types/enums";
import { ICall } from "../../types/models.types";

interface IConstructor {
    sequelize: Sequelize;
};

// Тип модели Calls, унаследованного от Sequelize
export type CallsInstance = ICall & Model & {};

export default class Calls {
    private _sequelize: Sequelize;
    private _callsModel: ModelStatic<CallsInstance> | undefined = undefined;

    constructor({ sequelize }: IConstructor) {
        this._sequelize = sequelize;
        this._init();
    }

    get calls() {
        return this._callsModel as ModelStatic<CallsInstance>;
    }

    private _init() {
        this._callsModel = this._sequelize.define<CallsInstance, ICall>("Calls", {
            id: {
                type: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: CallNames.OUTGOING
            },
            type: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: CallTypes.SINGLE
            },
            initiatorId: {
                type: DataTypes.UUIDV4,
                allowNull: true,
                field: "initiator_id"
            },
            chatId: {
                type: DataTypes.UUIDV4,
                allowNull: true,
                field: "chat_id"
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "start_time"
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "end_time"
            },
        })
    }
}