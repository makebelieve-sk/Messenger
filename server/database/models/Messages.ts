import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

import { MessageReadStatus, MessageTypes } from "@custom-types/enums";
import { IMessage } from "@custom-types/models.types";

// Тип модели Messages, унаследованного от Sequelize
export type MessagesInstance = IMessage & Model & {};

export default class Messages {
  private _messagesModel!: ModelStatic<MessagesInstance>;

  constructor(private readonly _sequelize: Sequelize) {
    this._init();
  }

  get messages() {
    return this._messagesModel;
  }

  private _init() {
    this._messagesModel = this._sequelize.define<MessagesInstance, IMessage>("Messages", {
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
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: MessageTypes.MESSAGE
      },
      createDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "create_date"
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: MessageReadStatus.NOT_READ,
        field: "is_read"
      },
      callId: {
        type: DataTypes.UUIDV4,
        allowNull: true,
        field: "call_id"
      }
    })
  }
}