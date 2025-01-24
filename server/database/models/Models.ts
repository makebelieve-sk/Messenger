import { Sequelize } from "sequelize";

import BlockUsers from "./BlockedUsers";
import Calls from "./Calls";
import ChatSoundNotifications from "./ChatSoundNotifications";
import DeletedChats from "./DeletedChats";
import FilesInMessage from "./FilesInMessage";
import Chats from "./Chats";
import DeletedMessages from "./DeletedMessages";
import Files from "./Files";
import Friends from "./Friends";
import Messages from "./Messages";
import Photos from "./Photos";
import ReadMessages from "./ReadMessages";
import Subscribers from "./Subscribers";
import UserDetail from "./UserDetails";
import UsersInCall from "./UsersInCalls";
import UsersInChat from "./UsersInChat";
import Users from "./Users";

// Класс, содержит доступы ко всем таблицам базы данных
export default class Models {
    private _blockUsers!: BlockUsers;
    private _calls!: Calls;
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
    private _usersInCall!: UsersInCall;
    private _usersInChat!: UsersInChat;
    private _users!: Users;

    constructor(private readonly _sequelize: Sequelize) {
        this._init();
    }

    get blockUsers() {
        return this._blockUsers.blockUsers;
    }
    get calls() {
        return this._calls.calls;
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
    get usersInCall() {
        return this._usersInCall.usersInCall;
    }
    get usersInChat() {
        return this._usersInChat.usersInChat;
    }
    get users() {
        return this._users.users;
    }

    private _init() {
        this._blockUsers = new BlockUsers(this._sequelize);
        this._calls = new Calls(this._sequelize);
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
        this._usersInCall = new UsersInCall(this._sequelize);
        this._usersInChat = new UsersInChat(this._sequelize);
        this._users = new Users(this._sequelize);
    }
}