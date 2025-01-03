import React from "react";
import { useNavigate } from "react-router-dom";
import LinkComponent from "../Common/Link";

import { Pages } from "../../types/enums";

import "./copyright.scss";

export default function Copyright() {
	const navigate = useNavigate();

	return (
		<div className="copyright">
			Copyright ©
			<LinkComponent
				href={Pages.aboutUs}
				variant="body2"
				onClick={() => navigate(Pages.aboutUs)}
			>
				ВК-КЛОН
			</LinkComponent>{" "}
			{new Date().getFullYear()}.
		</div>
	);
};
