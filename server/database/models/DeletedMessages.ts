import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IDeletedMessages } from "@custom-types/models.types";

// Тип модели DeletedMessages, унаследованного от Sequelize
export type DeletedMessagesInstance = IDeletedMessages & Model & {};

export default class DeletedMessages {
  private _deletedMessagesModel!: ModelStatic<DeletedMessagesInstance>;

  constructor(private readonly _sequelize: Sequelize) {
    this._init();
  }

  get deletedMessages() {
    return this._deletedMessagesModel;
  }

  private _init() {
    this._deletedMessagesModel = this._sequelize.define<DeletedMessagesInstance, IDeletedMessages>("Deleted_messages", {
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
    })
  }
}