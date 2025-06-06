interface ICloseIcon {
    className?: string;
    onClick?: () => void;
    size?: string | number;
};

// Иконка закрытия
export default function CloseIconComponent({ className, onClick, size = 24 }: ICloseIcon) {
	const iconSize = typeof size === "number" ? `${size}px` : size;

	return <svg
		data-testid="close-icon"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width={iconSize}
		height={iconSize}
		className={className}
		onClick={onClick}
	>
		<path 
			d="M18 6L6 18M6 6l12 12" 
			stroke="currentColor" 
			strokeWidth="2" 
			strokeLinecap="round" 
			strokeLinejoin="round" 
		/>
	</svg>;
};