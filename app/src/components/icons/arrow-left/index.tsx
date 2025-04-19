interface IArrowLeftIcon {
    className?: string;
    onClick?: () => void;
    size?: string | number;
};

// Иконка стрелки "Назад"
export default function ArrowLeftIconComponent({ className, onClick, size = 24 }: IArrowLeftIcon) {
	const iconSize = typeof size === "number" ? `${size}px` : size;

	return <svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width={iconSize}
		height={iconSize}
		className={className}
		onClick={onClick}
	>
		<path 
			d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6z" 
			fill="currentColor" 
			stroke="currentColor" 
			strokeWidth="0" 
			strokeLinecap="round" 
			strokeLinejoin="round" 
		/>
	</svg>;
}
