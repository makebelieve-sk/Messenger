interface ILockIcon {
    className?: string;
    onClick?: () => void;
    size?: string | number;
};

// Иконка блокировки
export default function LockIconComponent({ className, onClick, size = 24 }: ILockIcon) {
	const iconSize = typeof size === "number" ? `${size}px` : size;

	return <svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width={iconSize}
		height={iconSize}
		className={className}
		onClick={onClick}
	>
		{/* eslint-disable-next-line max-len */}
		<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2M9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9zm9 14H6V10h12zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" />
	</svg>;
}
