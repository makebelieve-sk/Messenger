import { PayloadAction } from "@reduxjs/toolkit";

import { ErrorStateType } from "@custom-types/redux.types";

export default {
    setError: (state: ErrorStateType, action: PayloadAction<string | null>) => {
        state.error = action.payload;
    },
    setSystemError: (state: ErrorStateType, action: PayloadAction<string | null>) => {
        state.systemError = action.payload;
    }
};