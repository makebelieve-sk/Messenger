const useImage = (src: string | null): string => {
	return src || "/assets/images/noPhoto.jpg";
};

export default useImage; 