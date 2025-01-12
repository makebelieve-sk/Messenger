import { useContext } from "react";

import { MainClientContext } from "../components/main/Main";
import { MY_ID } from "../utils/constants";

export default function useProfile(userId: string = MY_ID) {
    const mainClient = useContext(MainClientContext);
    return mainClient.getProfile(userId);
};