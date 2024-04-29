import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IFile } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

// Тип модели Files, унаследованного от Sequelize
export type FilesInstance = IFile & Model & {};

export default class Files {
  private _sequelize: Sequelize;
  private _filesModel: ModelStatic<FilesInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get files() {
    return this._filesModel as ModelStatic<FilesInstance>;
  }

  private _init() {
    this._filesModel = this._sequelize.define<FilesInstance, IFile>("Files", {
      id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      path: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      extension: {
        type: DataTypes.TEXT,
        allowNull: false,
      }
    })
  }
}