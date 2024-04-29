import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IFilesInMessage } from "../../types/models.types";

interface IConstructor {
  sequelize: Sequelize;
};

// Тип модели FilesInMessages, унаследованного от Sequelize
export type FilesInMessageInstance = IFilesInMessage & Model & {};

export default class FilesInMessage {
  private _sequelize: Sequelize;
  private _filesInMessageModal: ModelStatic<FilesInMessageInstance> | undefined = undefined;

  constructor({ sequelize }: IConstructor) {
    this._sequelize = sequelize;
    this._init();
  }

  get filesInMessage() {
    return this._filesInMessageModal as ModelStatic<FilesInMessageInstance>;
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