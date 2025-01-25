import { configureStore } from "@reduxjs/toolkit";

import errorReducer from "@store/error/slice";
import friendReducer from "@store/friend/slice";
import mainReducer from "@store/main/slice";
import messageReducer from "@store/message/slice";
import userReducer from "@store/user/slice";

export default configureStore({
    reducer: {
        error: errorReducer,
        friends: friendReducer,
        main: mainReducer,
        messages: messageReducer,
        users: userReducer,
    }
});