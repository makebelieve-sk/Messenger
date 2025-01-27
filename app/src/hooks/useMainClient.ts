import { useContext } from "react";

import { MainClientContext } from "@components/main/Main";

// Возврат сущности "MainClient"
export default function useMainClient() {
    return useContext(MainClientContext);
}