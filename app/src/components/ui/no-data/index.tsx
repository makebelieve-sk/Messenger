import { memo } from "react";

import "./no-items.scss";

interface INoDataComponent {
	text: string;
};

// Базовый компонент отсутствия данных
export default memo(function NoDataComponent({ text }: INoDataComponent) {
	return <div data-testid="no-data" className="opacity-text no-items">
		{text}
	</div>;
});