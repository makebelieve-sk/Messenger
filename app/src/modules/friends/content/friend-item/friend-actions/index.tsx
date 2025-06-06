import { FriendsTab } from "common-types";
import { memo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";

import SmallButtonComponent from "@components/services/buttons/small-button";
import SpinnerComponent from "@components/ui/spinner";
import useUser from "@hooks/useUser";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";
import useUIStore from "@store/ui";
import { type IFriend } from "@custom-types/friends.types";

import "./friend-actions.scss";

// Действие, доступное для текущего пользователя в зависимости от вкладки раздела
export default memo(function FriendActions({ friend }: { friend: IFriend; }) {
	const [ loadingNewDialog ] = useState(false);

	const currentTab = useFriendsStore(state => state.mainTab === FriendsTab.ALL 
		? state.contentTab 
		: state.mainTab,
	);

	const isLoadingLeftInFollowersAction = useFriendsStore(state => state.isLoadingLeftInFollowersAction);
	const isLoadingUnfollowAction = useFriendsStore(state => state.isLoadingUnfollowAction);
	const isLoadingAddFriendAction = useFriendsStore(state => state.isLoadingAddFriendAction);
	const isLoadingAcceptAction = useFriendsStore(state => state.isLoadingAcceptAction);
	const isLoadingFollowAction = useFriendsStore(state => state.isLoadingFollowAction);
	const isLoadingDeleteFriendAction = useFriendsStore(state => state.isLoadingDeleteFriendAction);
	const isLoadingBlockFriendAction = useFriendsStore(state => state.isLoadingBlockFriendAction);
	const isLoadingUnblockAction = useFriendsStore(state => state.isLoadingUnblockAction);

	const friendsService = useUser().friendsService;

	switch (currentTab) {
	case FriendsTab.MY:
	case FriendsTab.ONLINE:
		return <span className="friend-actions__write-message" onClick={_ => friendsService.writeMessage(friend.id)}>
			{loadingNewDialog || isLoadingDeleteFriendAction || isLoadingBlockFriendAction
				? <div className="friend-actions__write-message__loading">
					<SpinnerComponent size={24} />
				</div>
				: i18next.t("friends-module.actions.write_message")
			}
		</span>;
	case FriendsTab.FOLLOWERS:
		return <SmallButtonComponent
			variant="outlined"
			className="friend-actions__action"
			color="success"
			disabled={isLoadingAddFriendAction}
			onClick={_ => friendsService.addFriend(friend.id)}
		>
			{i18next.t("friends-module.actions.add_friend")}
		</SmallButtonComponent>;
	case FriendsTab.INCOMING_REQUESTS:
		return <span className="friend-actions__accept">
			<SmallButtonComponent
				variant="outlined"
				className="friend-actions__action"
				color="success"
				disabled={isLoadingAcceptAction}
				onClick={_ => friendsService.accept(friend.id)}
			>
				{i18next.t("friends-module.actions.accept")}
			</SmallButtonComponent>

			<SmallButtonComponent
				variant="outlined"
				className="friend-actions__action"
				color="error"
				disabled={isLoadingLeftInFollowersAction}
				onClick={_ => friendsService.leftInFollowers(friend.id)}
			>
				{i18next.t("friends-module.actions.decline")}
			</SmallButtonComponent>
		</span>;
	case FriendsTab.OUTGOING_REQUESTS:
		return <SmallButtonComponent
			variant="outlined"
			className="friend-actions__action"
			color="error"
			disabled={isLoadingUnfollowAction}
			onClick={_ => friendsService.unfollow(friend.id)}
		>
			{i18next.t("friends-module.actions.unfollow")}
		</SmallButtonComponent>;
	case FriendsTab.SEARCH:
		return <SmallButtonComponent
			variant="outlined"
			className="friend-actions__action"
			color="success"
			startIcon={<AddIcon className="friend-actions__add-icon" />}
			disabled={isLoadingFollowAction}
			onClick={_ => friendsService.followFriend(friend.id)}
		>
			{i18next.t("friends-module.actions.add_friend")}
		</SmallButtonComponent>;
	case FriendsTab.BLOCKED:
		return <SmallButtonComponent
			variant="outlined"
			className="friend-actions__action"
			color="success"
			disabled={isLoadingUnblockAction}
			onClick={_ => friendsService.unblock(friend.id)}
		>
			{i18next.t("friends-module.actions.unblock")}
		</SmallButtonComponent>;
	default:
		useUIStore.getState().setError(i18next.t("friends-module.error.unknown_tab", { tab: currentTab }));
		return null;
	}
});