import { create } from "zustand";

import { type ISignUpErrors } from "@pages/SignUp";

interface IAuthState {
    signUpErrors: ISignUpErrors | null;
    signInErrors: boolean;
	signInLoading: boolean;
	signUpLoading: boolean;
	chooseAvatarLoading: boolean;
};

interface IAuthActions {
    setSignUpErrors: (signUpErrors: ISignUpErrors) => void;
    setSignInErrors: (signInErrors: boolean) => void;
	setSignInLoading: (signInLoading: boolean) => void;
	setSignUpLoading: (signUpLoading: boolean) => void;
	setChooseAvatarLoading: (chooseAvatarLoading: boolean) => void;
    reset: () => void;
};

// Состояние стора для сброса (используется при выходе)
const resetState = {
	signUpErrors: null,
	signInErrors: false,
	signInLoading: false,
	signUpLoading: false,
	chooseAvatarLoading: false,
};

// Состояние глобальных переменных приложения
const useAuthStore = create<IAuthState & IAuthActions>(set => ({
	...resetState,

	setSignUpErrors: signUpErrors => set({ signUpErrors }),
	setSignInErrors: signInErrors => set({ signInErrors }),
	setSignInLoading: signInLoading => set({ signInLoading }),
	setSignUpLoading: signUpLoading => set({ signUpLoading }),
	setChooseAvatarLoading: chooseAvatarLoading => set({ chooseAvatarLoading }),
	reset: () => set({ ...resetState }),
}));

export default useAuthStore;