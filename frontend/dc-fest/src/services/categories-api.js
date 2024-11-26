import { API } from "../utils/api";

export const fetchCategories = async () => {
    const response = await API.get('/api/categories', {
        withCredentials: true
    });
    
    return response.data;
};

export const fetchCategoryById = async (id) => {
    const response = await API.get(`/api/categories/${id}`, {
        withCredentials: true
    });
    
    return response.data;
};


export const addAvailableEvent = async (availableEvent) => {
    const response = await API.post(`/api/available-events`, availableEvent, {
        withCredentials: true
    });
    
    return response.data;
};
