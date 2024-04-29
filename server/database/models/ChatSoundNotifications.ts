import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IChatSoundNotifications } from "../../types/models.types";

interface IConstructor {
    sequelize: Sequelize;
};

// Тип модели ChatSoundNotifications, унаследованного от Sequelize
export type ChatSoundNotificationsInstance = IChatSoundNotifications & Model & {};

export default class ChatSoundNotifications {
    private _sequelize: Sequelize;
    private _chatSoundNotificationsModel: ModelStatic<ChatSoundNotificationsInstance> | undefined = undefined;

    constructor({ sequelize }: IConstructor) {
        this._sequelize = sequelize;
        this._init();
    }

    get chatSoundNotifications() {
        return this._chatSoundNotificationsModel as ModelStatic<ChatSoundNotificationsInstance>;
    }

    private _init() {
        this._chatSoundNotificationsModel = this._sequelize.define<ChatSoundNotificationsInstance, IChatSoundNotifications>("Chat_sound_notifications", {
            id: {
                type: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            chatId: {
                type: DataTypes.UUIDV4,
                allowNull: false,
                field: "chat_id"
            },
            userId: {
                type: DataTypes.UUIDV4,
                allowNull: false,
                field: "user_id"
            }
        })
    }
}