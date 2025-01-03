import React from "react";

import { MainClientContext } from "../service/AppService";

export default function useMainClient() {
    return React.useContext(MainClientContext);
}