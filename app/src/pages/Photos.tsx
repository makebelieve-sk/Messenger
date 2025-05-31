import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { type ListOnScrollProps } from "react-window";

import BoxComponent from "@components/ui/box";
import InputImageComponent from "@components/ui/input-image";
import PaperComponent from "@components/ui/paper";
import PhotoComponent from "@components/ui/photo";
import SpinnerComponent from "@components/ui/spinner";
import UpperButton from "@components/ui/upper-button";
import usePrepareAnotherUser from "@hooks/usePrepareAnotherUser";
import useProfile from "@hooks/useProfile";
import useUser from "@hooks/useUser";
import VirtualList, { type VirtualListHandle } from "@modules/virtual-list/list";
import i18next from "@service/i18n";
import usePhotosStore from "@store/photos";
import { type IPhoto } from "@custom-types/models.types";
import { PHOTOS_LIMIT, VIRTUAL_SCROLL_TRESHOLD } from "@utils/constants";

import "@styles/pages/photos.scss";

const ITEM_HEIGHT = 250;    // Такая же высота необходима быть указана в scss файле для высоты .photo
const COLS = 3;
const GAP = 8;

// Страница "Фотографии"
export default function Photos() {
	const [ showUpButton, setShowUpButton ] = useState(false);

	const containerRef = useRef<HTMLDivElement | null>(null);
	const virtualRef = useRef<VirtualListHandle | null>(null);

	const { isLoading: isLoadingAnotherUser, isExistProfile } = usePrepareAnotherUser();

	const { userId } = useParams();

	const photos = usePhotosStore(state => state.photos);
	const isLoading = usePhotosStore(state => state.isPhotosLoading);
	const hasMore = usePhotosStore(state => state.hasMore);
	const isAddPhotosLoading = usePhotosStore(state => state.isAddPhotosLoading);

	const profile = useProfile(isLoadingAnotherUser || !isExistProfile ? undefined : userId);
	const photosService = useUser(isLoadingAnotherUser || !isExistProfile ? undefined : userId).photosService;

	useEffect(() => {
		usePhotosStore.getState().reset();
	}, [ userId ]);

	/**
	 * Обработчик, вызываемый при изменении видимых элементов списка.
	 * Отдаём обещание, чтобы InfiniteLoader знал, когда закончился запрос.
	 * Также, эта функция выполняется при первоначальной подгрузке данных, когда экран может быть очень высоким,
	 * а количество подгружаемых элементов (PHOTOS_LIMIT) настроено на маленькое число.
	 */	
	const loadMoreItems = useCallback(() => {
		if (!hasMore || isLoading) {
			return Promise.resolve();
		}

		// Возвращаем промис, который завершится в successCb
		return new Promise<void>(resolve => {
			photosService.getAllPhotos(resolve);
		});
	}, [ hasMore, isLoading, photosService, userId ]);

	// Обработка скролла
	const handleScroll = useCallback(({ scrollOffset }: ListOnScrollProps) => {
		// Показываем кнопку "Вверх" после 600px прокрутки
		setShowUpButton(scrollOffset > VIRTUAL_SCROLL_TRESHOLD);
	}, []);

	// Скролл до самого верха
	const scrollToTop = () => {
		virtualRef.current?.scrollTop();
	};	

	// Явно задаем, что должен отрисовать на каждой строке виртуального списка
	const renderCb = useCallback(({ item, itemWidth, itemHeight }: { item: IPhoto; itemWidth: number; itemHeight: number; }) => {
		return <div key={item.id} className="photos__container__item" style={{ width: itemWidth, height: itemHeight }}>
			<PhotoComponent
				src={`${item.path}?w=${itemWidth * 2}`}
				alt={item.id}
				isLazy
				clickHandler={() => photosService.onClickPhoto(item.id)}
				deleteHandler={() => photosService.deletePhoto({
					photoId: item.id,
					imageUrl: item.path,
					isAvatar: false,
				})}
			/>
		</div>;
	}, [ photosService ]);

	// Добавление новых фотографий
	const addPhotosHandler = (e: ChangeEvent<HTMLInputElement>) => {
		const fileList = e.target.files;

		if (fileList && fileList.length) {
			const formData = new FormData();
			const files = Array.from(fileList);

			files.forEach((file) => {
				formData.append("photo", file);
			});

			photosService.addPhotos(formData);
		}
	};

	// При первом входе на страницу по урлу другого пользователя, показываем спиннер, пока ждем его подгрузки и создание его профиля
	if (isLoadingAnotherUser || !isExistProfile) {
		return <div className="user-profile-page-spinner">
			<SpinnerComponent />
		</div>;
	}

	return <PaperComponent className="photos paper-block">
		<BoxComponent ref={containerRef} className="photos__container">
			{profile.isMe
				?
				<InputImageComponent
					id="photos-add-new-photos"
					text={i18next.t("photos-module.add_more")}
					loading={isAddPhotosLoading}
					multiple
					onChange={addPhotosHandler}
				/>
				: null
			}

			<VirtualList<IPhoto>
				ref={containerRef}
				virtualRef={virtualRef}
				items={photos}
				options={{ cols: COLS, gap: GAP, itemHeight: ITEM_HEIGHT }}
				hasMore={hasMore}
				emptyText={i18next.t("photos-module.empty")}
				isLoading={isLoading}
				limit={PHOTOS_LIMIT}
				loadMore={loadMoreItems}
				renderCb={renderCb}
				onScroll={handleScroll}
			/>

			{showUpButton ? <UpperButton onClick={scrollToTop} /> : null}
		</BoxComponent>
	</PaperComponent>;
};