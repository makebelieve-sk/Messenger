import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

import { IUsersInChat } from "@custom-types/models.types";

// Тип модели UsersInChat, унаследованного от Sequelize
export type UsersInChatInstance = IUsersInChat & Model & {};

export default class UsersInChat {
  private _usersInChatModel!: ModelStatic<UsersInChatInstance>;

  constructor(private readonly _sequelize: Sequelize) {
    this._init();
  }

  get usersInChat() {
    return this._usersInChatModel;
  }

  private _init() {
    this._usersInChatModel = this._sequelize.define<UsersInChatInstance, IUsersInChat>("Users_in_chat", {
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
      }
    })
  }
}