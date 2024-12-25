import { API } from "../utils/api";

export const fetchUserByEmail = async (email) => {
    const response = await API.get(`/api/users/email/${email}`, {
        withCredentials: true
    });

    return response.data;
};

export const fetchUsers = async () => {
    const response = await API.get(`/api/users?page=1`, {
        withCredentials: true
    });

    return response.data;
};

export const updateUser = async (updatedUser) => {
    const response = await API.put(`/api/users`, updatedUser,  {
        withCredentials: true
    });

    return response.data;
};

export const createUser = async (newUser) => {
    const response = await API.post(`/api/users`, newUser,  {
        withCredentials: true
    });

    return response.data;
};