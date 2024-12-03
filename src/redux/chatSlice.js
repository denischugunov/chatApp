import { createSlice } from "@reduxjs/toolkit";

// слайс для работы со списком чатов (сюда попадает фильтрованный список чатов для конкретного юзера)
const initialState = {
  chats: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setChatsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setChatsError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setChats, setChatsLoading, setChatsError } = chatSlice.actions;

export default chatSlice.reducer;
