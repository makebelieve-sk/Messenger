import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IBlockUsers } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

// Тип модели BlockUsers, унаследованного от Sequelize
export type BlockUsersInstance = IBlockUsers & Model & {};

export default class BlockUsers {
  private _sequelize: Sequelize;
  private _blockUsersModel: ModelStatic<BlockUsersInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get blockUsers() {
    return this._blockUsersModel as ModelStatic<BlockUsersInstance>;
  }

  private _init() {
    this._blockUsersModel = this._sequelize.define<BlockUsersInstance, IBlockUsers>("Block_users", {
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
      userBlocked: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        field: "user_blocked"
      }
    });
  }
}