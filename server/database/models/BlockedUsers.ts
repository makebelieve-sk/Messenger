import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IBlockUsers } from "@custom-types/models.types";

// Тип модели BlockUsers, унаследованного от Sequelize
export type BlockUsersInstance = IBlockUsers & Model & {};

export default class BlockUsers {
  private _blockUsersModel!: ModelStatic<BlockUsersInstance>;

  constructor(private readonly _sequelize: Sequelize) {
    this._init();
  }

  get blockUsers() {
    return this._blockUsersModel;
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