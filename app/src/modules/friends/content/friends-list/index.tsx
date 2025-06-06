import { FriendsTab } from "common-types";
import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { type ListOnScrollProps } from "react-window";

import BoxComponent from "@components/ui/box";
import InputSearch from "@components/ui/input-search";
import ListComponent from "@components/ui/list";
import UpperButton from "@components/ui/upper-button";
import useUser from "@hooks/useUser";
import EmptyFriends from "@modules/friends/content/empty-friends";
import FriendItem from "@modules/friends/content/friend-item";
import VirtualList, { type VirtualListHandle } from "@modules/virtual-list/list";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";
import useUIStore from "@store/ui";
import { type IFriend } from "@custom-types/friends.types";
import { FRIENDS_LIMIT, VIRTUAL_SCROLL_TRESHOLD } from "@utils/constants";

import "./friends-list.scss";

const ITEM_HEIGHT = 100;
const COLS = 1;
const GAP = 8;

const EMPTY_FRIENDS_LIST = [];
const EMPTY_IS_LOADING = false;
const EMPTY_HAS_MORE = false;
const EMPTY_SEARCH_VALUE = "";

interface IFriendsList {
    virtualRef: RefObject<VirtualListHandle | null>;
};

// Список карточек друзей, согласно выбранной вкладке
export default function FriendsList({ virtualRef }: IFriendsList) {
	const [ showUpButton, setShowUpButton ] = useState(false);

	const containerRef = useRef<HTMLDivElement | null>(null);

	const currentTab = useFriendsStore(state => state.mainTab === FriendsTab.ALL
		? state.contentTab
		: state.mainTab,
	);

	const friends = useFriendsStore(state => {
		switch (currentTab) {
		case FriendsTab.MY: return state.myFriends;
		case FriendsTab.ONLINE: return state.onlineFriends;
		case FriendsTab.FOLLOWERS: return state.followers;
		case FriendsTab.BLOCKED: return state.blockedFriends;
		case FriendsTab.OUTGOING_REQUESTS: return state.outgoingRequests;
		case FriendsTab.INCOMING_REQUESTS: return state.incomingRequests;
		case FriendsTab.SEARCH: return state.searchFriends;
		case FriendsTab.COMMON: return state.commonFriends;
		default: return EMPTY_FRIENDS_LIST;
		}
	});

	const loadingContent = useFriendsStore(state => {
		switch (currentTab) {
		case FriendsTab.MY: return state.isLoadingMyFriends;
		case FriendsTab.ONLINE: return state.isLoadingOnlineFriends;
		case FriendsTab.FOLLOWERS: return state.isLoadingFollowers;
		case FriendsTab.BLOCKED: return state.isLoadingBlockedFriends;
		case FriendsTab.OUTGOING_REQUESTS: return state.isLoadingOutgoingRequests;
		case FriendsTab.INCOMING_REQUESTS: return state.isLoadingIncomingRequests;
		case FriendsTab.SEARCH: return state.isLoadingPossibleFriends;
		case FriendsTab.COMMON: return state.isLoadingCommonFriends;
		default: return EMPTY_IS_LOADING;
		}
	});

	const hasMore = useFriendsStore(state => {
		switch (currentTab) {
		case FriendsTab.MY: return state.hasMoreMyFriends;
		case FriendsTab.ONLINE: return state.hasMoreOnlineFriends;
		case FriendsTab.FOLLOWERS: return state.hasMoreFollowers;
		case FriendsTab.BLOCKED: return state.hasMoreBlockedFriends;
		case FriendsTab.OUTGOING_REQUESTS: return state.hasMoreOutgoingRequests;
		case FriendsTab.INCOMING_REQUESTS: return state.hasMoreIncomingRequests;
		case FriendsTab.SEARCH: return state.hasMoreSearchFriends;
		case FriendsTab.COMMON: return state.hasMoreCommonFriends;
		default: return EMPTY_HAS_MORE;
		}
	});

	const searchValue = useFriendsStore(state => {
		switch (currentTab) {
		case FriendsTab.MY: return state.searchMyFriends;
		case FriendsTab.ONLINE: return state.searchOnlineFriends;
		case FriendsTab.FOLLOWERS: return state.searchFollowers;
		case FriendsTab.BLOCKED: return state.searchBlockedFriends;
		case FriendsTab.OUTGOING_REQUESTS: return state.searchOutgoingRequests;
		case FriendsTab.INCOMING_REQUESTS: return state.searchIncomingRequests;
		case FriendsTab.SEARCH: return state.searchPossibleFriends;
		case FriendsTab.COMMON: return state.searchCommonFriends;
		default: return EMPTY_SEARCH_VALUE;
		}
	});

	const { userId } = useParams();
	const friendsService = useUser(userId).friendsService;

	// Проверка валидности текущей вкладки
	useEffect(() => {
		if (!Object.values(FriendsTab).includes(currentTab)) {
			useUIStore.getState().setError(i18next.t("friends-module.error.unknown_tab", { tab: currentTab }));
		}
	}, [ currentTab ]);

	// Загрузка следующих данных
	const loadMoreItems = useCallback(() => {
		if (!hasMore || loadingContent) {
			return Promise.resolve();
		}

		// Возвращаем промис, который завершится в successCb
		return new Promise<void>(resolve => {
			friendsService.loadMore(currentTab, () => resolve());
		});
	}, [ hasMore, loadingContent, currentTab ]);

	// Отправка сообщения другу
	// const writeMessage = (friend: IFriend | null) => {
	//     if (friend && friend.id && userId) {
	//         // Получаем chatId с сервера
	//         Request.post(ApiRoutes.getChatId, { friendId: friend.id }, setLoadingNewDialog,
	//             (data: { success: boolean, chatId: string }) => {
	//                 const pathname = Pages.messages + "/" + data.chatId;

	//                 // Сохраняем пользователей в чате
	//                 dispatch(setUsersInChat([user, friend]));

	//                 // Не показываем в url-строке данные поля query, для этого передаем второй параметр
	//                 router.push({
	//                     pathname,
	//                     query: {
	//                         chatId: data.chatId,
	//                         chatName: getFullName(friend),
	//                         chatAvatar: friend.avatarUrl
	//                     }
	//                 }, pathname);
	//             },
	//             (error: any) => CatchErrors.catch(error, router, dispatch)
	//         );
	//     } else {
	//         CatchErrors.catch("Не указан id друга", router, dispatch);
	//     }
	// };

	// Обработка скролла
	const handleScroll = useCallback(({ scrollOffset }: ListOnScrollProps) => {
		// Показываем кнопку "Вверх" после 600px прокрутки
		setShowUpButton(scrollOffset > VIRTUAL_SCROLL_TRESHOLD);
	}, []);

	// Скролл до самого верха
	const scrollToTop = () => {
		virtualRef.current?.scrollTop("smooth");
	};

	// Явно задаем, что должен отрисовать на каждой строке виртуального списка
	const renderCb = useCallback(({ item }: { item: IFriend; }) => {
		return <FriendItem key={item.id + "item"} friend={item} />;
	}, []);

	// Обработка изменения значения поля поиска
	const onChangeSearchValue = (newValue: string) => {
		scrollToTop();
		friendsService.search(currentTab, newValue);
	};

	return <div className="friends-list">
		<InputSearch
			haveBorder
			placeholder={i18next.t("friends-module.search_placeholder")}
			value={searchValue}
			onChange={onChangeSearchValue}
		/>

		{(!friends || !friends.length) && !loadingContent
			? <EmptyFriends />
			: <ListComponent className="friends-list__container" disablePadding>
				<BoxComponent ref={containerRef} className="friends-list__container__list">
					<VirtualList<IFriend>
						ref={containerRef}
						virtualRef={virtualRef}
						items={friends}
						options={{ cols: COLS, gap: GAP, itemHeight: ITEM_HEIGHT }}
						hasMore={hasMore}
						isLoading={loadingContent}
						limit={FRIENDS_LIMIT}
						loadMore={loadMoreItems}
						renderCb={renderCb}
						onScroll={handleScroll}
					/>

					{showUpButton ? <UpperButton onClick={scrollToTop} /> : null}
				</BoxComponent>
			</ListComponent>
		}
	</div>;
};