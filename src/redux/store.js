import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import chatReducer from "./chatSlice";
import themeReducer from "./themeSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    chats: chatReducer,
    theme: themeReducer,
  },
});

export default store;
