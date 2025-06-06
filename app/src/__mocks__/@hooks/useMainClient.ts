const mockMainApi = {
	getAnotherUser: jest.fn(),
	signIn: jest.fn(),
	signUp: jest.fn(),
	logout: jest.fn(),
	uploadAvatarAuth: jest.fn(),
	getFriendsNotification: jest.fn(),
	getMessageNotification: jest.fn(),
	openFile: jest.fn(),
};

const useMainClient = jest.fn().mockReturnValue({ 
	mainApi: mockMainApi,
	getProfile: jest.fn(),
	existProfile: jest.fn(),
	lifeTimeExpire: jest.fn(),
	removeProfile: jest.fn(),
	downloadLogFile: jest.fn(),
});

export default useMainClient;
export { mockMainApi }; 