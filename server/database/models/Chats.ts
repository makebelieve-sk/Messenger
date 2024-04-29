import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IChat } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

// Тип модели Chats, унаследованного от Sequelize
export type ChatsInstance = IChat & Model & {};

export default class Chats {
  private _sequelize: Sequelize;
  private _chatModel: ModelStatic<ChatsInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get chats() {
    return this._chatModel as ModelStatic<ChatsInstance>;
  }

  private _init() {
    this._chatModel = this._sequelize.define<ChatsInstance, IChat>("Chats", {
      id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
      },
      avatarUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "avatar_url"
      }
    })
  }
}