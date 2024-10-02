import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";
import { IChatSoundNotifications } from "../../types/models.types";

// Тип модели ChatSoundNotifications, унаследованного от Sequelize
export type ChatSoundNotificationsInstance = IChatSoundNotifications & Model & {};

export default class ChatSoundNotifications {
    private _chatSoundNotificationsModel!: ModelStatic<ChatSoundNotificationsInstance>;

    constructor(private readonly _sequelize: Sequelize) {
        this._init();
    }

    get chatSoundNotifications() {
        return this._chatSoundNotificationsModel;
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