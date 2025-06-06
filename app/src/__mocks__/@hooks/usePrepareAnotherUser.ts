export interface IUsePrepareAnotherUser {
  isLoading: boolean;
  isExistProfile: boolean;
}

const mockUsePrepareAnotherUser = (): IUsePrepareAnotherUser => ({
	isLoading: false,
	isExistProfile: true,
});

export default mockUsePrepareAnotherUser; 