import { useState, useEffect } from "react";
import { NO_PHOTO, API_URL } from "@utils/constants";

// Возврат корректного адреса картинки
export default function useImage(src?: string) {
    const [srcImage, setSrcImage] = useState(NO_PHOTO);

    useEffect(() => {
        setSrcImage(src
            ? `${API_URL}${src}`
            : NO_PHOTO
        );
    }, [src]);

    return srcImage;
};