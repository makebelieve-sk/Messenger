import { type StoreApi } from "zustand";

import { Profile } from "@core/models/Profile";

export interface IProfileState {
    showEditAlert: boolean;
    isEditLoading: boolean;
    editErrors?: { field?: string; fields?: string[]; };
    isDeleteAvatarLoading: boolean;
    isDeleteAccountLoading: boolean;
    isPrepareAnotherUser: boolean;
    profile: Profile | null;
    isMe: boolean;
}

export interface IProfileActions {
    setShowEditAlert: (showEditAlert: boolean) => void;
    setEditLoading: (isEditLoading: boolean) => void;
    setEditErrors: (editErrors: { field?: string; fields?: string[]; }) => void;
    setDeleteAvatarLoading: (isDeleteAvatarLoading: boolean) => void;
    setDeleteAccountLoading: (isDeleteAccountLoading: boolean) => void;
    setPrepareAnotherUser: (isPrepareAnotherUser: boolean) => void;
    reset: () => void;
    setProfile: (profile: Profile | null) => void;
    setIsMe: (isMe: boolean) => void;
}

const initialState = {
	showEditAlert: false,
	isEditLoading: false,
	editErrors: undefined,
	isDeleteAvatarLoading: false,
	isDeleteAccountLoading: false,
	isPrepareAnotherUser: true,
	profile: null,
	isMe: false,
};

const mockProfileStore: IProfileState & IProfileActions = {
	...initialState,
	setShowEditAlert: jest.fn(),
	setEditLoading: jest.fn(),
	setEditErrors: jest.fn(),
	setDeleteAvatarLoading: jest.fn(),
	setDeleteAccountLoading: jest.fn(),
	setPrepareAnotherUser: jest.fn(),
	reset: jest.fn(),
	setProfile: jest.fn(),
	setIsMe: jest.fn(),
};

const useProfileStore = jest.fn((selector) => selector(mockProfileStore)) as unknown as StoreApi<IProfileState & IProfileActions>;
useProfileStore.getState = () => mockProfileStore;

export default useProfileStore; 