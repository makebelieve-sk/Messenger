import { memo } from "react";

import "./no-items.scss";

// Базовый компонент отсутствия данных
export default memo(function NoDataComponent({ text }: { text: string; }) {
    return <div data-testid="no-data" className="opacity-text no-items">
        {text}
    </div>
});