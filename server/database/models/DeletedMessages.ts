import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IDeletedMessages } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

// Тип модели DeletedMessages, унаследованного от Sequelize
export type DeletedMessagesInstance = IDeletedMessages & Model & {};

export default class DeletedMessages {
  private _sequelize: Sequelize;
  private _deletedMessagesModel: ModelStatic<DeletedMessagesInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get deletedMessages() {
    return this._deletedMessagesModel as ModelStatic<DeletedMessagesInstance>;
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