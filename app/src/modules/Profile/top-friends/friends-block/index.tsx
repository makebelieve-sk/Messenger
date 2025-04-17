import { JSX, memo } from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Paper from "@mui/material/Paper";

import AvatarComponent from "@components/ui/avatar";
import SpinnerComponent from "@components/ui/spinner";
import { type IUser } from "@custom-types/models.types";
import { getFullName } from "@utils/index";

import "./friends.scss";

interface IFriendsBlock {
	state: IFriendsBlockState;
	isLoading?: boolean;
	children: JSX.Element;
	onClickBlock: () => void;
};

interface IFriendsBlockState {
	title: string;
	count: number;
	users: IUser[] | null;
};

// Компонент, отрисовывающий блок друзей (онлайн и обычных)
export default memo(function FriendsBlock({ state, isLoading = false, children, onClickBlock }: IFriendsBlock) {
	return <Grid item>
		<Paper className="friends-container paper-block">
			<div className="block-title" onClick={onClickBlock}>
				{state.title} <span className="counter">{state.count}</span>
			</div>

			{isLoading 
				? <SpinnerComponent />
				: state.users && state.users.length 
					? <List className="friends-container__top-friends__list">
						{state.users.map(user => {
							const userName = getFullName(user);

							return <ListItem className="friends-container__top-friends__item" key={user.id}>
								<ListItemAvatar className="friends-container__top-friends__item__avatar-block">
									<AvatarComponent 
										userId={user.id}
										src={user.avatarUrl} 
										alt={userName}
										size={50} 
									/>
								</ListItemAvatar>

								{user.firstName}
							</ListItem>;
						})}
					</List>
					: children
			}
		</Paper>
	</Grid>;
});
