import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IUsersInCall } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

// Тип модели UsersInCall, унаследованного от Sequelize
export type UsersInCallInstance = IUsersInCall & Model & {};

export default class UsersInCall {
  private _sequelize: Sequelize;
  private _usersInCallModel: ModelStatic<UsersInCallInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get usersInCall() {
    return this._usersInCallModel as ModelStatic<UsersInCallInstance>;
  }

  private _init() {
    this._usersInCallModel = this._sequelize.define<UsersInCallInstance, IUsersInCall>("Users_in_call", {
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
      callId: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        field: "call_id"
      }
    })
  }
}