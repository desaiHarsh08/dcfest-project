import { configureStore } from '@reduxjs/toolkit'
import toggleLoadingReducer from './slices/toggleLoadingSlice'
import toggleRefetchReducer from './slices/toggleRefetchSlice'

export const store = configureStore({
    reducer: {
        loading: toggleLoadingReducer,
        refetch: toggleRefetchReducer,
    },
})