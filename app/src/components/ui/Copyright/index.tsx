import { useNavigate } from "react-router-dom";

import LinkComponent from "@components/ui/link";
import i18next from "@service/i18n";
import { Pages } from "@custom-types/enums";

import "./copyright.scss";

// Базовый компонент Copyright
export default function CopyrightComponent() {
	const navigate = useNavigate();

	return <div className="copyright" data-testid="copyright">
		{i18next.t("ui.copyright")}

		<LinkComponent href={Pages.aboutUs} variant="body2" onClick={() => navigate(Pages.aboutUs)}>
			{i18next.t("ui.product_name")}
		</LinkComponent>

		{new Date().getFullYear()}.
	</div>;
};