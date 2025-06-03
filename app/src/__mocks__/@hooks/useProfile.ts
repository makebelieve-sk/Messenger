import { type IPhoto } from "@custom-types/models.types";

const mockNotificationSettingsService = {
	soundEnabled: false,
	messageSound: false,
	friendRequestSound: false,
	changeSoundNotifications: jest.fn(),
};

const mockPhotosService = {
	photos: [] as IPhoto[],
	count: 0,
	getAllPhotos: jest.fn(),
	onClickPhoto: jest.fn(),
	addPhotoFromAvatar: jest.fn(),
	addPhotos: jest.fn(),
	deletePhoto: jest.fn(),
};

const mockUserDetailsService = {
	updateDetails: jest.fn(),
	syncUserDetails: jest.fn(),
	getFriendsText: jest.fn(),
	getSubscribersText: jest.fn(),
	getPhotosText: jest.fn(),
	getAudiosText: jest.fn(),
	getVideosText: jest.fn(),
};

const mockUserService = {
	photosService: mockPhotosService,
	detailsService: mockUserDetailsService,
	settingsService: mockNotificationSettingsService,
	id: "",
	firstName: "",
	thirdName: "",
	phone: "",
	email: "",
	fullName: "",
	avatarUrl: "",
	avatarCreateDate: "",
	updateUser: jest.fn(),
	syncInfo: jest.fn(),
	changeAvatar: jest.fn(),
};

const mockProfileService = {
	isMe: false,
	userService: mockUserService,
	photosService: mockPhotosService,
	deleteAccount: jest.fn(),
	onSetAvatar: jest.fn(),
	onDeleteAvatar: jest.fn(),
	onClickAvatar: jest.fn(),
	getFriends: jest.fn(),
	editInfo: jest.fn(),
};

const useProfile = jest.fn().mockReturnValue(mockProfileService);

export default useProfile;
export { 
	mockProfileService, 
	mockUserService, 
	mockPhotosService, 
	mockUserDetailsService, 
	mockNotificationSettingsService, 
};