import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IDeletedChats } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

// Тип модели Deleted_chats, унаследованного от Sequelize
export type DeletedChatsInstance = IDeletedChats & Model & {};

export default class DeletedChats {
  private _sequelize: Sequelize;
  private _deletedChatsModel: ModelStatic<DeletedChatsInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get deletedChats() {
    return this._deletedChatsModel as ModelStatic<DeletedChatsInstance>;
  }

  private _init() {
    this._deletedChatsModel = this._sequelize.define<DeletedChatsInstance, IDeletedChats>("Deleted_chats", {
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
      chatId: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        field: "chat_id"
      },
    })
  }
}