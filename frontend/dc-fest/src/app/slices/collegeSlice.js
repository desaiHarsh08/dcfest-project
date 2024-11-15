import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    college: null,
}

export const collegeSlice = createSlice({
    name: 'college',
    initialState,
    reducers: {
        setCollege: (state, actions) => {
            state.college = actions.payload;
        },
    },
})

// Action creators are generated for each case reducer function
export const { setCollege } = collegeSlice.actions

export const selectCollege = (state) => state.college.college

export default collegeSlice.reducer