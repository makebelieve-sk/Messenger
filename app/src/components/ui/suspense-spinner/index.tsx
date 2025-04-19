import { memo } from "react";

import SpinnerComponent from "@components/ui/spinner";

interface ISuspenseSpinner {
    className: string;
};

// Базовый компонент спиннера при использовании ленивой загрузки модуля
export default memo(function SuspenseSpinner({ className }: ISuspenseSpinner) {
	return <div className={className}>
		<SpinnerComponent />
	</div>;
});