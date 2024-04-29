import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IUserDetails } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

// Тип модели User, унаследованного от Sequelize
export type UserDetailsInstance = IUserDetails & Model & {};

export default class UserDetail {
  private _sequelize: Sequelize;
  private _userDetailsModel: ModelStatic<UserDetailsInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get userDetails() {
    return this._userDetailsModel as ModelStatic<UserDetailsInstance>;
  }

  private _init() {
    this._userDetailsModel = this._sequelize.define<UserDetailsInstance, IUserDetails>("User_details", {
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
      birthday: {
        type: DataTypes.STRING,
        allowNull: true
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true
      },
      work: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sex: {
        type: DataTypes.STRING,
        allowNull: true
      },
      lastSeen: {
        type: DataTypes.DATE,
        field: "last_seen",
        allowNull: true
      }
    })
  }
}