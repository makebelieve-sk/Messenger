import { memo, type ReactNode } from "react";

import BigUserAvatar from "@components/services/avatars/big-user-avatar";
import GridComponent from "@components/ui/grid";
import ListComponent from "@components/ui/list";
import ListItemComponent from "@components/ui/list-item";
import ListItemAvatarComponent from "@components/ui/list-item-avatar";
import PaperComponent from "@components/ui/paper";
import SpinnerComponent from "@components/ui/spinner";
import { type IFriend } from "@custom-types/friends.types";

import "./friends.scss";

interface IFriendsBlock {
	state: IFriendsBlockState;
	isLoading?: boolean;
	children: ReactNode;
	onClickBlock: () => void;
};

interface IFriendsBlockState {
	title: string;
	count: number;
	friends: Omit<IFriend, "createdAt">[] | null;
};

// Компонент, отрисовывающий блок друзей (онлайн и обычных)
export default memo(function FriendsBlock({ state, isLoading = false, children, onClickBlock }: IFriendsBlock) {
	return <GridComponent>
		<PaperComponent className="friends-container paper-block">
			<div className="block-title" onClick={onClickBlock}>
				{state.title} <span className="counter">{state.count}</span>
			</div>

			{isLoading 
				? <SpinnerComponent />
				: state.friends && state.friends.length 
					? <ListComponent className="friends-container__top-friends__list">
						{state.friends.slice(0, 6).map(friend => {
							return <ListItemComponent className="friends-container__top-friends__item" key={friend.id}>
								<ListItemAvatarComponent className="friends-container__top-friends__item__avatar-block">
									<BigUserAvatar 
										userId={friend.id}
										src={friend.avatarUrl} 
										alt={friend.fullName}
									/>
								</ListItemAvatarComponent>

								{friend.fullName.split(" ")[0]}
							</ListItemComponent>;
						})}
					</ListComponent>
					: children
			}
		</PaperComponent>
	</GridComponent>;
});