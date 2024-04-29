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

interface IConstructor {
    sequelize: Sequelize;
};

export default class Models {
    private _sequelize: Sequelize;

    private _blockUsers: BlockUsers | undefined = undefined;
    private _calls: Calls | undefined = undefined;
    private _chatSoundNotifications: ChatSoundNotifications | undefined = undefined;
    private _deletedChats: DeletedChats | undefined = undefined;
    private _filesInMessage: FilesInMessage | undefined = undefined;
    private _chats: Chats | undefined = undefined;
    private _deletedMessages: DeletedMessages | undefined = undefined;
    private _files: Files | undefined = undefined;
    private _friends: Friends | undefined = undefined;
    private _messages: Messages | undefined = undefined;
    private _photos: Photos | undefined = undefined;
    private _readMessages: ReadMessages | undefined = undefined;
    private _subscribers: Subscribers | undefined = undefined;
    private _userDetails: UserDetail | undefined = undefined;
    private _usersInCall: UsersInCall | undefined = undefined;
    private _usersInChat: UsersInChat | undefined = undefined;
    private _users: Users | undefined = undefined;

    constructor({ sequelize }: IConstructor) {
        this._sequelize = sequelize;
        this._init();
    }

    get sequelize() {
        return this._sequelize as Sequelize;
    }

    get blockUsers() {
        return (this._blockUsers as BlockUsers).blockUsers;
    }
    get calls() {
        return (this._calls as Calls).calls;
    }
    get chatSoundNotifications() {
        return (this._chatSoundNotifications as ChatSoundNotifications).chatSoundNotifications;
    }
    get deletedChats() {
        return (this._deletedChats as DeletedChats).deletedChats;
    }
    get filesInMessage() {
        return (this._filesInMessage as FilesInMessage).filesInMessage;
    }
    get chats() {
        return (this._chats as Chats).chats;
    }
    get deletedMessages() {
        return (this._deletedMessages as DeletedMessages).deletedMessages;
    }
    get files() {
        return (this._files as Files).files;
    }
    get friends() {
        return (this._friends as Friends).friends;
    }
    get messages() {
        return (this._messages as Messages).messages;
    }
    get photos() {
        return (this._photos as Photos).photos;
    }
    get readMessages() {
        return (this._readMessages as ReadMessages).readMessages;
    }
    get subscribers() {
        return (this._subscribers as Subscribers).subscribers;
    }
    get userDetails() {
        return (this._userDetails as UserDetail).userDetails;
    }
    get usersInCall() {
        return (this._usersInCall as UsersInCall).usersInCall;
    }
    get usersInChat() {
        return (this._usersInChat as UsersInChat).usersInChat;
    }
    get users() {
        return (this._users as Users).users;
    }

    private _init() {
        this._blockUsers = new BlockUsers({ sequelize: this.sequelize });
        this._calls = new Calls({ sequelize: this.sequelize });
        this._chatSoundNotifications = new ChatSoundNotifications({ sequelize: this.sequelize });
        this._deletedChats = new DeletedChats({ sequelize: this.sequelize });
        this._filesInMessage = new FilesInMessage({ sequelize: this.sequelize });
        this._chats = new Chats({ sequelize: this.sequelize });
        this._deletedMessages = new DeletedMessages({ sequelize: this.sequelize });
        this._files = new Files({ sequelize: this.sequelize });
        this._friends = new Friends({ sequelize: this.sequelize });
        this._messages = new Messages({ sequelize: this.sequelize });
        this._photos = new Photos({ sequelize: this.sequelize });
        this._readMessages = new ReadMessages({ sequelize: this.sequelize });
        this._subscribers = new Subscribers({ sequelize: this.sequelize });
        this._userDetails = new UserDetail({ sequelize: this.sequelize });
        this._usersInCall = new UsersInCall({ sequelize: this.sequelize });
        this._usersInChat = new UsersInChat({ sequelize: this.sequelize });
        this._users = new Users({ sequelize: this.sequelize });
    }
}