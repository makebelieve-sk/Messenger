import { useEffect, useState } from "react";

import { API_URL, NO_PHOTO } from "@utils/constants";

/**
 * Возврат корректного адреса картинки
 * Если src является внешним URL (начинается с http:// или https://), использует его как есть
 * Если src является локальным путем, добавляет API_URL для запроса статики с сервера
 * 
 * @param src - путь к локальному файлу или внешний URL (для OAuth авторизации)
 * @returns полный URL для отображения изображения
 */
export default function useImage(src: string | null) {
	const [ srcImage, setSrcImage ] = useState(NO_PHOTO);

	useEffect(() => {
		if (!src) {
			setSrcImage(NO_PHOTO);
			return;
		}
		
		// Если это уже полный URL (внешнее изображение из OAuth), используем как есть
		if (src.startsWith("http://") || src.startsWith("https://")) {
			setSrcImage(src);
		} else {
			// Локальный путь - добавляем API_URL для запроса статики с сервера
			setSrcImage(`${API_URL}${src}`);
		}
	}, [ src ]);

	return srcImage;
};