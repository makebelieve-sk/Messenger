import { memo, type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface IPortal {
    children: ReactNode;
    containerId?: string;
};

// Базовый компонент портала
export default memo(function Portal({ children, containerId }: IPortal) {
	// Монтируем портал согласно containerId
	useEffect(() => {
		if (containerId && !document.getElementById(containerId)) {
			const container = document.createElement("div");
			container.id = containerId;
			document.body.appendChild(container);
		}
	}, []);

	return createPortal(
		children,
		(containerId ? document.getElementById(containerId) : null) ?? document.body,
	);
});