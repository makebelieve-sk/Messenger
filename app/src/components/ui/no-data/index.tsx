import { memo } from "react";

import "./no-items.scss";

// Базовый компонент отсутствия данных
export default memo(function NoDataComponent({ text }: { text: string; }) {
	return <div className="opacity-text no-items">
		{text}
	</div>;
});
