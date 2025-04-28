import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

import { ISubscriber } from "@custom-types/models.types";

// Тип модели Subscribers, унаследованного от Sequelize
export type SubscribersInstance = ISubscriber & Model & {};

export default class Subscribers {
  private _subscribersModel!: ModelStatic<SubscribersInstance>;

  constructor(private readonly _sequelize: Sequelize) {
    this._init();
  }

  get subscribers() {
    return this._subscribersModel;
  }

  private _init() {
    this._subscribersModel = this._sequelize.define<SubscribersInstance, ISubscriber>("Subscribers", {
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
      subscriberId: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        field: "subscriber_id"
      },
      leftInSubs: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "left_in_subs"
      }
    })
  }
}