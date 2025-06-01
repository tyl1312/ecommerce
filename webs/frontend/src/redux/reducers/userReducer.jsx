import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  loggedIn: false,
  userRole: null,
  expirationTime: localStorage.getItem("expirationTime") || null,
  courseTitle: localStorage.getItem("courseTitle") || null,
  quizId: localStorage.getItem("quizId") || null,
  quizTitle: localStorage.getItem("quizTitle") || null
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("SET_LOGGED_IN", (state, action) => {
      state.loggedIn = action.payload;
    })
    .addCase("SET_USER_ROLE", (state, action) => {
      state.userRole = action.payload;
    })
    .addCase("SET_EXPIRATION_TIME", (state, action) => {
      state.expirationTime = action.payload;
    })
    .addCase("SET_USER_DATA", (state, action) => {
      state.userData = action.payload;
    })
    .addCase("SET_COURSE_DATA", (state, action) => {
      state.courseTitle = action.payload.courseTitle;
      state.quizId = action.payload.quizId;
      state.quizTitle = action.payload.quizTitle;
      // Persist to localStorage
      localStorage.setItem('courseTitle', action.payload.courseTitle);
      localStorage.setItem('quizId', action.payload.quizId);
      localStorage.setItem('quizTitle', action.payload.quizTitle);    });
});