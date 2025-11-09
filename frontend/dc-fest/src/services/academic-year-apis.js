import { API } from "../utils/api";

export const fetchActiveAcademicYear = async () => {
    const response = await API.get('/api/academic-years/active', {
        withCredentials: true
    });
    
    return response.data;
};

export const fetchAcademicYearById = async (id) => {
    const response = await API.get(`/api/academic-years/${id}`, {
        withCredentials: true
    });
    
    return response.data;
};

export const fetchAllAcademicYears = async () => {
    const response = await API.get('/api/academic-years', {
        withCredentials: true
    });
    
    return response.data;
};

export const fetchRegistrationDeadlineStatus = async () => {
    const response = await API.get('/api/academic-years/registration-deadline-status', {
        withCredentials: true
    });
    
    return response.data;
};

export const updateAcademicYear = async (id, academicYearData) => {
    const response = await API.put(`/api/academic-years/${id}`, academicYearData, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    });
    
    return response.data;
};

