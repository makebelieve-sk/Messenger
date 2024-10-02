import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { MessageReadStatus } from "../../types/enums";
import { IReadMessages } from "../../types/models.types";

// Тип модели Read_messages, унаследованного от Sequelize
export type ReadMessagesInstance = IReadMessages & Model & {};

export default class ReadMessages {
    private _readMessagesModel!: ModelStatic<ReadMessagesInstance>;

    constructor(private readonly _sequelize: Sequelize) {
        this._init();
    }

    get readMessages() {
        return this._readMessagesModel;
    }

    private _init() {
        this._readMessagesModel = this._sequelize.define<ReadMessagesInstance, IReadMessages>("Read_messages", {
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
            messageId: {
                type: DataTypes.UUIDV4,
                allowNull: false,
                field: "message_id"
            },
            isRead: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "is_read",
                defaultValue: MessageReadStatus.NOT_READ
            }
        })
    }
}