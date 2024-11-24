import { API } from "../utils/api";

export const fetchColleges = async () => {
    const response = await API.get('/api/colleges', {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};

export const fetchCollegeById = async (id) => {
    const response = await API.get(`/api/colleges/${id}`, {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};

export const deleteCollege = async (id) => {
    const response = await API.delete(`/api/colleges/${id}`, {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};

export const fetchCollegeByIcCode = async (icCode) => {
    const response = await API.get(`/api/colleges/ic-code/${icCode}`, {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};

export const createCollege = async (college) => {
    const response = await API.post('/api/colleges', college, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    });
    console.log(response)
    return response.data;
};

export const updateCollege = async (college) => {
    const response = await API.put(`/api/colleges/${college?.id}`, college, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    });
    console.log(response)
    return response.data;
};
export const resetPassword = async (college) => {
    console.log(college);
    const response = await API.put(`/api/colleges/reset-password/${college?.id}`, college, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    });
    console.log(response)
    return response.data;
};
