import { API } from "../utils/api";

export const fetchUserByEmail = async (email) => {
    const response = await API.get(`/api/users/email/${email}`, {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};