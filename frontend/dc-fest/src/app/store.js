import { configureStore } from '@reduxjs/toolkit'
import toggleLoadingReducer from './slices/toggleLoadingSlice'
import toggleRefetchReducer from './slices/toggleRefetchSlice'
import categoriesReducer from './slices/categoriesSlice'
import resetPasswordOneTimeReducer from './slices/resetPasswordOneTimeSlice'
import collegeReducer from './slices/collegeSlice'

export const store = configureStore({
    reducer: {
        loading: toggleLoadingReducer,
        refetch: toggleRefetchReducer,
        categories: categoriesReducer,
        resetPasswordOneTime: resetPasswordOneTimeReducer,
        college: collegeReducer
    },
})