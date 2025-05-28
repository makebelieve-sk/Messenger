import { FriendsTab } from "common-types";
import { memo, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import BigUserAvatar from "@components/services/avatars/big-user-avatar";
import ListItemComponent from "@components/ui/list-item";
import ListItemAvatarComponent from "@components/ui/list-item-avatar";
import ListItemTextComponent from "@components/ui/list-item-text";
import PopoverMenu from "@components/ui/popover-menu";
import useProfile from "@hooks/useProfile";
import useUser from "@hooks/useUser";
import FriendActions from "@modules/friends/content/friend-item/friend-actions";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";
import { IFriend } from "@custom-types/friends.types";
import { IS_MY_FRIENDS } from "@utils/constants";

import "./friend-item.scss";

interface IFriendItem {
	friend: IFriend;
};

// Строка из списка виртуального списка для любой вкладки раздела "Друзья"
export default memo(function FriendItem({ friend }: IFriendItem) {
	const [ anchorEl, setAnchorEl ] = useState<{ el: Element; id: string; } | null>(null);

	const currentTab = useFriendsStore(state => state.mainTab === FriendsTab.ALL
		? state.contentTab
		: state.mainTab,
	);

	const { userId } = useParams();
	const profile = useProfile(userId);
	const friendsService = useUser().friendsService;

	// Показывать меню всплывающего окна у друзей текущего пользователя
	const showPopoverMenu = useMemo(() => {
		return IS_MY_FRIENDS.includes(currentTab) && profile.isMe;
	}, [ currentTab, profile ]);

	// Получение id всплывающего окна
	const getPopoverId = (friendId: string) => {
		return `popover-list-item-${friendId}`;
	};

	// Получение элементов для выпадающего списка
	const getPopoverItems = (friendId: string) => {
		return [ {
			title: i18next.t("friends-module.actions.remove_friend"),
			onClick: () => friendsService.deleteFriend(friendId),
		}, {
			title: i18next.t("friends-module.actions.block"),
			onClick: () => friendsService.blockFriend(friendId),
		} ];
	};

	return <ListItemComponent className="friend-item" key={friend.id}>
		<ListItemAvatarComponent className="friend-item__avatar">
			<BigUserAvatar
				userId={friend.id}
				src={friend.avatarUrl}
				alt={friend.fullName}
			/>
		</ListItemAvatarComponent>

		<ListItemTextComponent
			className="friend-item__info"
			primary={friend.fullName}
			disableTypography
			secondary={profile.isMe
				? <FriendActions friend={friend} />
				: null
			}
		/>

		{showPopoverMenu
			? <>
				<MoreHorizIcon
					className="friend-item__more"
					aria-describedby={getPopoverId(friend.id)}
					onClick={event => setAnchorEl({ el: event.currentTarget, id: friend.id })}
				/>
				<PopoverMenu
					id={getPopoverId(friend.id)}
					anchorEl={anchorEl?.el}
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "left",
					}}
					open={Boolean(anchorEl?.id === friend.id)}
					onClose={() => setAnchorEl(null)}
					items={getPopoverItems(friend.id)}
				/>
			</>
			: null
		}
	</ListItemComponent>;
});