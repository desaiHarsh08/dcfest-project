import { API } from "../utils/api";

export const fetchRoundById = async (id) => {
    console.log(id)
    const response = await API.get(`/api/rounds/${id}`, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response.data;
};