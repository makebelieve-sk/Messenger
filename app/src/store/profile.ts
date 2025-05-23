import { create } from "zustand";

interface IProfileState {
    showEditAlert: boolean;
    isEditLoading: boolean;
    editErrors?: { field?: string; fields?: string[]; };
    isDeleteAvatarLoading: boolean;
	isDeleteAccountLoading: boolean;
	isPrepareAnotherUser: boolean;

};

interface IProfileActions {
    setShowEditAlert: (showEditAlert: boolean) => void;
    setEditLoading: (isEditLoading: boolean) => void;
    setEditErrors: (editErrors: { field?: string; fields?: string[]; }) => void;
    setDeleteAvatarLoading: (isDeleteAvatarLoading: boolean) => void;
	setDeleteAccountLoading: (isDeleteAccountLoading: boolean) => void;
    setPrepareAnotherUser: (isPrepareAnotherUser: boolean) => void;
    reset: () => void;
};

// Состояние по умолчанию
const initialState = {
	showEditAlert: false,
	isEditLoading: false,
	editErrors: undefined,
	isDeleteAvatarLoading: false,
	isDeleteAccountLoading: false,
	isPrepareAnotherUser: true,
};

// Состояние всех данных профиля
const useProfileStore = create<IProfileState & IProfileActions>(set => ({
	...initialState,

	setShowEditAlert: showEditAlert => set({ showEditAlert }),
	setEditLoading: isEditLoading => set({ isEditLoading }),
	setEditErrors: editErrors => set({ editErrors }),
	setDeleteAvatarLoading: isDeleteAvatarLoading => set({ isDeleteAvatarLoading }),
	setDeleteAccountLoading: isDeleteAccountLoading => set({ isDeleteAccountLoading }),
	setPrepareAnotherUser: isPrepareAnotherUser => set({ isPrepareAnotherUser }),
	reset: () => set({ ...initialState }),
}));

export default useProfileStore;