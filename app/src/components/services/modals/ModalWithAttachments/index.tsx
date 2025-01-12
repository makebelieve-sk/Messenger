import { useState, useEffect, useContext, memo } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@mui/material/Modal";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import { MainClientContext } from "../../../main/Main";
import { useAppDispatch, useAppSelector } from "../../../../hooks/useGlobalState";
import { selectMessagesState, setAttachments } from "../../../../store/messages/slice";
import { setImagesInCarousel } from "../../../../store/main/slice";
import { IFile } from "../../../../types/models.types";
import { currentSize } from "../../../../utils/files";
import { getHoursWithMinutes, transformDate } from "../../../../utils/time";
import SpinnerComponent from "../../../ui/Spinner";
import { ICarouselImage } from "../../../../modules/ImagesCarousel/Info/Info";

import "./modal-with-attachments.scss";

const modalTitle = "modal-attachments-title";
const modalDescription = "modal-attachments-description";

const TABS = {
    PHOTOS: 0,
    FILES: 1
};

export interface IAttachmentFile extends IFile {
    originalSrc: string;
    createDate: string;
};

export default memo(function ModalWithAttachments() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(TABS.PHOTOS);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<any[]>([]);
    const [files, setFiles] = useState<IAttachmentFile[]>([]);

    const mainClient = useContext(MainClientContext);

    const { t } = useTranslation();
    const { attachmentsModal } = useAppSelector(selectMessagesState);
    const dispatch = useAppDispatch();

    // Подгружаем вложения чата при открытии модального окна
    useEffect(() => {
        if (attachmentsModal) {
            setOpen(attachmentsModal.isOpen);

            if (attachmentsModal) {
                mainClient.mainApi.getAttachments(
                    { chatId: attachmentsModal.chatId }, 
                    setLoading,
                    (data: { images: ICarouselImage[]; files: IAttachmentFile[] }) => {
                        setImages(data.images);
                        setFiles(data.files);
                    }
                );
            }
        }
    }, [attachmentsModal]);

    // Закрытие модального окна
    const onClose = () => {
        setOpen(false);
        dispatch(setAttachments(null));
    };

    // Переключение вкладки
    const onChange = (_: React.SyntheticEvent, newTab: number) => {
        setValue(newTab);
    };

    // Клик по изображению
    const onSelect = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
        event.stopPropagation();

        dispatch(setImagesInCarousel({ images, index }));
    };

    // Открытие файла
    const onOpenFile = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, filePath: string) => {
        event.stopPropagation();

        mainClient.mainApi.openFile({ path: filePath });
    };

    // Переход к сообщению в чате
    const onGoToMessage = () => {
        console.log("Переход к сообщению в чате")
    };

    return <>
        <Modal 
            open={open} 
            onClose={onClose} 
            aria-labelledby={modalTitle} 
            aria-describedby={modalDescription}
        >
            <Box className="modal-attachments-container">
                <Tabs value={value} onChange={onChange}>
                    <Tab id="images" label={t("modals.photos")} />
                    <Tab id="files" label={t("modals.files")} />
                </Tabs>

                {loading
                    ? <SpinnerComponent />
                    : null
                }

                <div className="modal-attachments-container__tab" hidden={value !== TABS.PHOTOS || loading} role="tabpanel">
                    {images.length
                        ? <ImageList className="modal-attachments-container__tab__images" cols={2}>
                            {images.map((image, index) => (
                                <ImageListItem key={image.id} id={image.id} onClick={e => onSelect(e, index)}>
                                    <img
                                        srcSet={`${image.src}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                        src={`${image.src}?w=164&h=164&fit=crop&auto=format`}
                                        alt={image.alt}
                                        loading="lazy"
                                        className="modal-attachments-container__tab__images__image"
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                        : t("modals.images_not_yet")
                    }
                </div>

                <div className="modal-attachments-container__tab" hidden={value !== TABS.FILES || loading} role="tabpanel">
                    {files.length
                        ? <div className="modal-attachments-container__tab__files">
                            {files.map(file => {
                                const ext = file.name.split(".").pop();
                                const fileName = file.name.length > 50 ? file.name.slice(0, 50) + "..." + file.name.slice(file.name.length - 10) : file.name;

                                return <div key={file.id} className="modal-attachments-container__tab__files__file">
                                    <div className="modal-attachments-container__tab__files__file__icon" onClick={e => onOpenFile(e, file.originalSrc)}>
                                        {ext}
                                    </div>

                                    <div className="modal-attachments-container__tab__files__file__info">
                                        <div className="modal-attachments-container__tab__files__file__info__name" onClick={e => onOpenFile(e, file.originalSrc)}>
                                            {fileName}
                                        </div>

                                        <div className="modal-attachments-container__tab__files__file__info__size">
                                            {currentSize(file.size)}
                                        </div>

                                        <div className="modal-attachments-container__tab__files__file__info__date" onClick={onGoToMessage}>
                                            {transformDate(file.createDate, true)} в {getHoursWithMinutes(file.createDate)}
                                        </div>
                                    </div>
                                </div>
                            })}
                        </div>
                        : t("modals.files_not_yet")
                    }
                </div>
            </Box>
        </Modal>
    </>
});