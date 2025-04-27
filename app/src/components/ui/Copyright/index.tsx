import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LinkComponent from "@components/ui/link";
import { Pages } from "@custom-types/enums";

import "./copyright.scss";

// Базовый компонент Copyright
export default memo(function CopyrightComponent() {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<div data-testid="copyright" className="copyright">
			{ t("ui.copyright") }
			<LinkComponent
				href={Pages.aboutUs}
				variant="body2"
				onClick={() => navigate(Pages.aboutUs)}
			>
				{ t("ui.product_name") }
			</LinkComponent>{" "}
			{new Date().getFullYear()}.
		</div>
	);
});
