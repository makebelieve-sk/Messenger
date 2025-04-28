import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

import { IFilesInMessage } from "@custom-types/models.types";

// Тип модели FilesInMessages, унаследованного от Sequelize
export type FilesInMessageInstance = IFilesInMessage & Model & {};

export default class FilesInMessage {
  private _filesInMessageModal!: ModelStatic<FilesInMessageInstance>;

  constructor(private readonly _sequelize: Sequelize) {
    this._init();
  }

  get filesInMessage() {
    return this._filesInMessageModal;
  }

  private _init() {
    this._filesInMessageModal = this._sequelize.define<FilesInMessageInstance, IFilesInMessage>("Files_in_message", {
      id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fileId: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        field: "file_id"
      },
      messageId: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        field: "message_id"
      },
    })
  }
}