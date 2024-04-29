// Проверка, является ли файл изображением
export const isImage = (filename: string) => {
    const fileExt = filename.split(".").pop();
    const imgExts = ["png", "jpeg", "jpg"];

    return fileExt ? imgExts.includes(fileExt) : false;
};