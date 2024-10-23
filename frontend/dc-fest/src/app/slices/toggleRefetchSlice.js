import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    refetch: false,
}

export const toggleRefetchSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        toggleRefetch: (state) => {
            state.refetch = !state.refetch;
        },
    },
})

// Action creators are generated for each case reducer function
export const { toggleRefetch } = toggleRefetchSlice.actions

export default toggleRefetchSlice.reducer