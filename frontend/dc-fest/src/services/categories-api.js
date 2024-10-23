import { API } from "../utils/api";

export const fetchCategories = async () => {
    const response = await API.get('/api/categories', {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};

export const fetchCategoryById = async (id) => {
    const response = await API.get(`/api/categories/${id}`, {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};
