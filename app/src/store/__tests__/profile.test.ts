import useProfileStore from "../profile";

describe("useProfileStore", () => {
	test("setShowEditAlert updates showEditAlert", () => {
		useProfileStore.getState().setShowEditAlert(true);
		expect(useProfileStore.getState().showEditAlert).toBe(true);
	});

	test("setEditLoading updates isEditLoading", () => {
		useProfileStore.getState().setEditLoading(true);
		expect(useProfileStore.getState().isEditLoading).toBe(true);
	});

	test("setEditErrors updates editErrors", () => {
		const errors = { field: "username", fields: [ "email", "password" ] };
		useProfileStore.getState().setEditErrors(errors);
		expect(useProfileStore.getState().editErrors).toEqual(errors);
	});

	test("setDeleteAvatarLoading updates isDeleteAvatarLoading", () => {
		useProfileStore.getState().setDeleteAvatarLoading(true);
		expect(useProfileStore.getState().isDeleteAvatarLoading).toBe(true);
	});

	test("setDeleteAccountLoading updates isDeleteAccountLoading", () => {
		useProfileStore.getState().setDeleteAccountLoading(true);
		expect(useProfileStore.getState().isDeleteAccountLoading).toBe(true);
	});

	test("setPrepareAnotherUser updates isPrepareAnotherUser", () => {
		useProfileStore.getState().setPrepareAnotherUser(false);
		expect(useProfileStore.getState().isPrepareAnotherUser).toBe(false);
	});

	test("reset restores default state", () => {
		useProfileStore.getState().setShowEditAlert(true);
		useProfileStore.getState().setEditLoading(true);
		useProfileStore.getState().setEditErrors({ field: "test", fields: [ "test" ] });
		useProfileStore.getState().setDeleteAvatarLoading(true);
		useProfileStore.getState().setDeleteAccountLoading(true);
		useProfileStore.getState().setPrepareAnotherUser(false);

		useProfileStore.getState().reset();

		const state = useProfileStore.getState();
		expect(state.showEditAlert).toBe(false);
		expect(state.isEditLoading).toBe(false);
		expect(state.editErrors).toBeUndefined();
		expect(state.isDeleteAvatarLoading).toBe(false);
		expect(state.isDeleteAccountLoading).toBe(false);
		expect(state.isPrepareAnotherUser).toBe(true);
	});
});
