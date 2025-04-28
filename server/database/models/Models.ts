import { Sequelize } from "sequelize";
import BlockUsers from "@database/models/BlockedUsers";
import Chats from "@database/models/Chats";
import ChatSoundNotifications from "@database/models/ChatSoundNotifications";
import DeletedChats from "@database/models/DeletedChats";
import DeletedMessages from "@database/models/DeletedMessages";
import Files from "@database/models/Files";
import FilesInMessage from "@database/models/FilesInMessage";
import Friends from "@database/models/Friends";
import Messages from "@database/models/Messages";
import Photos from "@database/models/Photos";
import ReadMessages from "@database/models/ReadMessages";
import Subscribers from "@database/models/Subscribers";
import UserDetail from "@database/models/UserDetails";
import Users from "@database/models/Users";
import UsersInChat from "@database/models/UsersInChat";

// Класс, содержит доступы ко всем таблицам базы данных
export default class Models {
    private _blockUsers!: BlockUsers;
    private _chatSoundNotifications!: ChatSoundNotifications;
    private _deletedChats!: DeletedChats;
    private _filesInMessage!: FilesInMessage;
    private _chats!: Chats;
    private _deletedMessages!: DeletedMessages;
    private _files!: Files;
    private _friends!: Friends;
    private _messages!: Messages;
    private _photos!: Photos;
    private _readMessages!: ReadMessages;
    private _subscribers!: Subscribers;
    private _userDetails!: UserDetail;
    private _usersInChat!: UsersInChat;
    private _users!: Users;

    constructor(private readonly _sequelize: Sequelize) {
        this._init();
    }

    get blockUsers() {
        return this._blockUsers.blockUsers;
    }
    get chatSoundNotifications() {
        return this._chatSoundNotifications.chatSoundNotifications;
    }
    get deletedChats() {
        return this._deletedChats.deletedChats;
    }
    get filesInMessage() {
        return this._filesInMessage.filesInMessage;
    }
    get chats() {
        return this._chats.chats;
    }
    get deletedMessages() {
        return this._deletedMessages.deletedMessages;
    }
    get files() {
        return this._files.files;
    }
    get friends() {
        return this._friends.friends;
    }
    get messages() {
        return this._messages.messages;
    }
    get photos() {
        return this._photos.photos;
    }
    get readMessages() {
        return this._readMessages.readMessages;
    }
    get subscribers() {
        return this._subscribers.subscribers;
    }
    get userDetails() {
        return this._userDetails.userDetails;
    }
    get usersInChat() {
        return this._usersInChat.usersInChat;
    }
    get users() {
        return this._users.users;
    }

    private _init() {
        this._blockUsers = new BlockUsers(this._sequelize);
        this._chatSoundNotifications = new ChatSoundNotifications(this._sequelize);
        this._deletedChats = new DeletedChats(this._sequelize);
        this._filesInMessage = new FilesInMessage(this._sequelize);
        this._chats = new Chats(this._sequelize);
        this._deletedMessages = new DeletedMessages(this._sequelize);
        this._files = new Files(this._sequelize);
        this._friends = new Friends(this._sequelize);
        this._messages = new Messages(this._sequelize);
        this._photos = new Photos(this._sequelize);
        this._readMessages = new ReadMessages(this._sequelize);
        this._subscribers = new Subscribers(this._sequelize);
        this._userDetails = new UserDetail(this._sequelize);
        this._usersInChat = new UsersInChat(this._sequelize);
        this._users = new Users(this._sequelize);
    }
}