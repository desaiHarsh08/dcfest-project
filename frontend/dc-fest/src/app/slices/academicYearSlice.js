import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    academicYear: null,
    year: null, // Extracted year for easy access
    isLoading: false,
    error: null,
}

export const academicYearSlice = createSlice({
    name: 'academicYear',
    initialState,
    reducers: {
        setAcademicYear: (state, action) => {
            state.academicYear = action.payload;
            state.year = action.payload?.year || null;
            state.isLoading = false;
            state.error = null;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        clearAcademicYear: (state) => {
            state.academicYear = null;
            state.year = null;
            state.isLoading = false;
            state.error = null;
        },
    },
})

// Action creators are generated for each case reducer function
export const { setAcademicYear, setLoading, setError, clearAcademicYear } = academicYearSlice.actions

export const selectAcademicYear = (state) => state.academicYear.academicYear
export const selectAcademicYearYear = (state) => state.academicYear.year
export const selectAcademicYearLoading = (state) => state.academicYear.isLoading
export const selectAcademicYearError = (state) => state.academicYear.error

export default academicYearSlice.reducer

