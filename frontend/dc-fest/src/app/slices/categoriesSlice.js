import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    categories: [],
}

export const categoriesSice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        setCategories: (state, actions) => {
            state.categories = actions.payload;
        },
    },
})

// Action creators are generated for each case reducer function
export const { setCategories } = categoriesSice.actions

export const selectCategories = (state) => state.categories.categories

export default categoriesSice.reducer