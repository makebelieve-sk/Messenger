import React from "react";

import { MainClientContext } from "../service/AppService";
import { MY_ID } from "../utils/constants";

export default function useProfile(userId: string = MY_ID) {
    const mainClient = React.useContext(MainClientContext);
    return mainClient.getProfile(userId);
};