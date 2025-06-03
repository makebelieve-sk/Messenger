import useAuthStore from "../auth";

describe("useAuthStore", () => {
	beforeEach(() => {
		useAuthStore.getState().reset();
	});

	test("default state", () => {
		const state = useAuthStore.getState();
		expect(state.signUpErrors).toBeNull();
		expect(state.signInErrors).toBe(false);
		expect(state.signInLoading).toBe(false);
		expect(state.signUpLoading).toBe(false);
		expect(state.chooseAvatarLoading).toBe(false);
	});

	test("setSignUpErrors updates signUpErrors", () => {
		const errors = { status: 400, email: "invalid", password: "short" };
		useAuthStore.getState().setSignUpErrors(errors);
		expect(useAuthStore.getState().signUpErrors).toEqual(errors);
	});

	test("setSignInErrors updates signInErrors", () => {
		useAuthStore.getState().setSignInErrors(true);
		expect(useAuthStore.getState().signInErrors).toBe(true);
	});

	test("setSignInLoading updates signInLoading", () => {
		useAuthStore.getState().setSignInLoading(true);
		expect(useAuthStore.getState().signInLoading).toBe(true);
	});

	test("setSignUpLoading updates signUpLoading", () => {
		useAuthStore.getState().setSignUpLoading(true);
		expect(useAuthStore.getState().signUpLoading).toBe(true);
	});

	test("setChooseAvatarLoading updates chooseAvatarLoading", () => {
		useAuthStore.getState().setChooseAvatarLoading(true);
		expect(useAuthStore.getState().chooseAvatarLoading).toBe(true);
	});

	test("reset restores initial state", () => {
		useAuthStore.getState().setSignInErrors(true);
		useAuthStore.getState().setSignInLoading(true);
        
		useAuthStore.getState().reset();
        
		const state = useAuthStore.getState();
		expect(state.signUpErrors).toBeNull();
		expect(state.signInErrors).toBe(false);
		expect(state.signInLoading).toBe(false);
		expect(state.signUpLoading).toBe(false);
		expect(state.chooseAvatarLoading).toBe(false);
	});
});
