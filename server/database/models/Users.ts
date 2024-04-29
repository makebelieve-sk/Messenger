import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IUser } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

export interface ISaveUser {
  id: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  email: string;
  phone: string;
  avatarUrl: string;
};

// Тип модели User, унаследованного от Sequelize
export type UserInstance = IUser & Model & {};

export default class Users {
  private _sequelize: Sequelize;
  private _usersModel: ModelStatic<UserInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get users() {
    return this._usersModel as ModelStatic<UserInstance>;
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
