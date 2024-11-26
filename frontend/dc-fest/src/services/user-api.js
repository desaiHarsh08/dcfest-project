import { API } from "../utils/api";

export const fetchUserByEmail = async (email) => {
    const response = await API.get(`/api/users/email/${email}`, {
        withCredentials: true
    });

    return response.data;
};