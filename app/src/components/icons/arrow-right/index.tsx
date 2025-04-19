interface IArrowRightIcon {
    className?: string;
    onClick?: () => void;
    size?: string | number;
};

// Иконка стрелки "Вперед"
export default function ArrowRightIconComponent({ className, onClick, size = 24 }: IArrowRightIcon) {
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
			d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" 
			fill="currentColor" 
			stroke="currentColor" 
			strokeWidth="0" 
			strokeLinecap="round" 
			strokeLinejoin="round" 
		/>
	</svg>;
}
