import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    loading: false,
}

export const toggleLoadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        toggleLoading: (state) => {
            state.loading = !state.loading;
        },
    },
})

// Action creators are generated for each case reducer function
export const { toggleLoading } = toggleLoadingSlice.actions

export default toggleLoadingSlice.reducer