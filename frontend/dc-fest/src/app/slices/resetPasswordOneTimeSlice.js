import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    flag: false,
}

export const resetPasswordOneTimeSlice = createSlice({
    name: 'resetPasswordOneTime',
    initialState,
    reducers: {
        setFlag: (state) => {
            state.flag = !state.flag;
        },
    },
})

// Action creators are generated for each case reducer function
export const { setFlag } = resetPasswordOneTimeSlice.actions

export const selectResetPasswordFlag = (state) => state.resetPasswordOneTime.flag 

export default resetPasswordOneTimeSlice.reducer