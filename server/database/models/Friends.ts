import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

import { IFriend } from "@custom-types/models.types";

// Тип модели Friends, унаследованного от Sequelize
export type FriendsInstance = IFriend & Model & {};

export default class Friends {
  private _friendsModel!: ModelStatic<FriendsInstance>;

  constructor(private readonly _sequelize: Sequelize) {
    this._init();
  }

  get friends() {
    return this._friendsModel;
  }

  private _init() {
    this._friendsModel = this._sequelize.define<FriendsInstance, IFriend>("Friends", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        field: "user_id"
      },
      friendId: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        field: "friend_id"
      }
    })
  }
}