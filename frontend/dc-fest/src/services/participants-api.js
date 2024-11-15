import { API } from "../utils/api";

export const createParticipants = async (participants) => {
    const response = await API.post(`/api/participants`, participants, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log(response)
    return response.data;
};

export const fetchParticipantsByEventId = async (eventId) => {
    const response = await API.get(`/api/participants/event/${eventId}`, {
        withCredentials: true,
    });
    console.log(response)
    return response.data;
};