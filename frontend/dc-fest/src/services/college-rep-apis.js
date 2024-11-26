import { API } from "../utils/api";

export const createCollegeRep = async (obj) => {
    const response = await API.post('/api/representatives', obj, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    });
    
    return response.data;
};