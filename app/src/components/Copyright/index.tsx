import React from "react";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Pages } from "../../types/enums";

import "./copyright.scss";

export default React.memo(function Copyright() {
    const navigate = useNavigate();

    return (
        <div className="copyright">
            Copyright ©
            <Link href={Pages.aboutUs} variant="body2" onClick={() => navigate(Pages.aboutUs)}>
                ВК-КЛОН
            </Link>
            {" "}{new Date().getFullYear()}.
        </div>
    );
});