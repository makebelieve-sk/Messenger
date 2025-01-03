import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IUser } from "../../types/models.types";

// Тип модели User, унаследованного от Sequelize
export type UserInstance = IUser & Model & {};

export default class Users {
  private _usersModel!: ModelStatic<UserInstance>;

  constructor(private readonly _sequelize: Sequelize) {
    this._init();
  }

  get users() {
    return this._usersModel;
  }

  private _init() {
    this._usersModel = this._sequelize.define<UserInstance, IUser>("Users", {
      id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "first_name"
      },
      secondName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "second_name"
      },
      thirdName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "third_name"
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "avatar_url"
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });
  }
}
