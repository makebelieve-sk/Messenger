import { useEffect, useState } from "react";

import { API_URL, NO_PHOTO } from "@utils/constants";

// Возврат корректного адреса картинки
export default function useImage(src: string | null) {
	const [ srcImage, setSrcImage ] = useState(NO_PHOTO);

	useEffect(() => {
		setSrcImage(src ? `${API_URL}${src}` : NO_PHOTO);
	}, [ src ]);

	return srcImage;
}
