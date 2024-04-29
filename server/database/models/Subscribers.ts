import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { ISubscriber } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

// Тип модели Subscribers, унаследованного от Sequelize
export type SubscribersInstance = ISubscriber & Model & {};

export default class Subscribers {
  private _sequelize: Sequelize;
  private _subscribersModel: ModelStatic<SubscribersInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get subscribers() {
    return this._subscribersModel as ModelStatic<SubscribersInstance>;
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