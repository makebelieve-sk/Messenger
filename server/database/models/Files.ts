import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

import { IFile } from "@custom-types/models.types";

// Тип модели Files, унаследованного от Sequelize
export type FilesInstance = IFile & Model & {};

export default class Files {
  private _filesModel!: ModelStatic<FilesInstance>;

  constructor(private readonly _sequelize: Sequelize) {
    this._init();
  }

  get files() {
    return this._filesModel;
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