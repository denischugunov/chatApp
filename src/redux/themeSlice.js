import { createSlice } from "@reduxjs/toolkit";

// Слайс с состоянием темы пользователя
const initialState = {
  theme: "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload; 
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light"; 
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
