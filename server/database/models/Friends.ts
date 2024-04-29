import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IFriend } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

// Тип модели Friends, унаследованного от Sequelize
export type FriendsInstance = IFriend & Model & {};

export default class Friends {
  private _sequelize: Sequelize;
  private _friendsModel: ModelStatic<FriendsInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get friends() {
    return this._friendsModel as ModelStatic<FriendsInstance>;
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