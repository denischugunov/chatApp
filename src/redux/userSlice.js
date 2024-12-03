import { createSlice } from "@reduxjs/toolkit";

// слайс с данными о пользователе (получается с БД после авторизации)
const initialState = {
  userData: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setUserLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setUserData, setUserLoading, setUserError } = userSlice.actions;

export default userSlice.reducer;
