import { type ISignUpErrors } from "@pages/SignUp";

interface IAuthState {
    signUpErrors: ISignUpErrors | null;
    signInErrors: boolean;
    signInLoading: boolean;
    signUpLoading: boolean;
    chooseAvatarLoading: boolean;
};

const initialState: IAuthState = {
	signUpErrors: null,
	signInErrors: false,
	signInLoading: false,
	signUpLoading: false,
	chooseAvatarLoading: false,
};

let state = { ...initialState };

const useAuthStore = () => ({
	...state,
	setSignUpErrors: (signUpErrors: ISignUpErrors) => {
		state = { ...state, signUpErrors };
	},
	setSignInErrors: (signInErrors: boolean) => {
		state = { ...state, signInErrors };
	},
	setSignInLoading: (signInLoading: boolean) => {
		state = { ...state, signInLoading };
	},
	setSignUpLoading: (signUpLoading: boolean) => {
		state = { ...state, signUpLoading };
	},
	setChooseAvatarLoading: (chooseAvatarLoading: boolean) => {
		state = { ...state, chooseAvatarLoading };
	},
	reset: () => {
		state = { ...initialState };
	},
});

useAuthStore.getState = () => ({
	...state,
	setSignUpErrors: (signUpErrors: ISignUpErrors) => {
		state = { ...state, signUpErrors };
	},
	setSignInErrors: (signInErrors: boolean) => {
		state = { ...state, signInErrors };
	},
	setSignInLoading: (signInLoading: boolean) => {
		state = { ...state, signInLoading };
	},
	setSignUpLoading: (signUpLoading: boolean) => {
		state = { ...state, signUpLoading };
	},
	setChooseAvatarLoading: (chooseAvatarLoading: boolean) => {
		state = { ...state, chooseAvatarLoading };
	},
	reset: () => {
		state = { ...initialState };
	},
});

export default useAuthStore; 