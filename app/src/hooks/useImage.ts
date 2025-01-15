import { useState, useEffect } from "react";
import { NO_PHOTO, SERVER_URL } from "../utils/constants";

// Возврат корректного адреса картинки
export default function useImage(src?: string) {
    const [srcImage, setSrcImage] = useState(src);

    useEffect(() => {
        setSrcImage(src
            ? `${SERVER_URL}${src}`
            : NO_PHOTO
        );
    }, [src]);

    return srcImage as string;
};