import React from "react";
import { NO_PHOTO, SERVER_URL } from "../utils/constants";

export default function useImage(src?: string) {
    const [srcImage, setSrcImage] = React.useState(src);

    React.useEffect(() => {
        setSrcImage(src
            ? `${SERVER_URL}${src}`
            : NO_PHOTO
        );
    }, [src]);

    return srcImage as string;
};