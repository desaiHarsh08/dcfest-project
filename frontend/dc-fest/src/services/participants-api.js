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

export const updateParticipant = async (participant) => {
    const response = await API.put(`/api/participants/${participant?.id}`, participant, {
        withCredentials: true,
    });
    console.log(response)
    return response.data;
};

export const deleteParticipant = async (id) => {
    const response = await API.delete(`/api/participants/${id}`, {
        withCredentials: true,
    });
    console.log(response)
    return response.data;
};