import { memo } from "react";

import ModalWithImagesCarousel from "@components/services/modals/carousel";
import ModalWithConfirm from "@components/services/modals/confirm";
import ModalWithError from "@components/services/modals/error";
import ModalWithSettings from "@components/services/modals/settings";
import SnackbarError from "@components/services/snackbars/error";

// Компонент, содержащий дополнительные "сервисные" модули, такие как всплывающие/модальные окна и подсказки
export default memo(function ServiceComponents({ isAuth }: { isAuth: boolean; }) {
	return <>
		<ModalWithError />
		<ModalWithConfirm />
		<SnackbarError />

		{isAuth 
			? <>
				<ModalWithImagesCarousel />
				<ModalWithSettings />
			</>
			: null}
	</>;
});