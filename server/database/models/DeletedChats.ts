import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IDeletedChats } from "../../types/models.types";

// Тип модели Deleted_chats, унаследованного от Sequelize
export type DeletedChatsInstance = IDeletedChats & Model & {};

export default class DeletedChats {
  private _deletedChatsModel!: ModelStatic<DeletedChatsInstance>;

  constructor(private readonly _sequelize: Sequelize) {
    this._init();
  }

  get deletedChats() {
    return this._deletedChatsModel;
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