import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveAcademicYear } from '../services/academic-year-apis';
import { setAcademicYear, setLoading, setError, selectAcademicYearYear } from '../app/slices/academicYearSlice';

const AcademicYearProvider = ({ children }) => {
  const dispatch = useDispatch();
  const year = useSelector(selectAcademicYearYear);

  useEffect(() => {
    const loadAcademicYear = async () => {
      try {
        dispatch(setLoading(true));
        const academicYear = await fetchActiveAcademicYear();
        dispatch(setAcademicYear(academicYear));
      } catch (error) {
        console.error('Error fetching academic year:', error);
        dispatch(setError(error.message));
      }
    };

    loadAcademicYear();
  }, [dispatch]);

  // Update document title when year changes
  useEffect(() => {
    if (year) {
      document.title = `UMANG - ${year} | BESC`;
    }
  }, [year]);

  return children;
};

export default AcademicYearProvider;

