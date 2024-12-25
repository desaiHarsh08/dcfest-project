import { API } from "../utils/api";

export const createParticipants = async (participants) => {
    const response = await API.post(`/api/participants`, participants, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response.data;
};

export const addParticipant = async (participant) => {
    const response = await API.post(`/api/participants/add-participant`, participant, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response.data;
};

export const fetchParticipantsByEventId = async (eventId) => {
    const response = await API.get(`/api/participants/event/${eventId}`, {
        withCredentials: true,
    });

    return response.data;
};


export const fetchParticipantsByCollegeId = async (collegeId) => {
    const response = await API.get(`/api/participants/college/${collegeId}`, {
        withCredentials: true,
    });

    return response.data;
};

export const fetchParticipants = async (page) => {
    const response = await API.get(`/api/participants?page=${page}`, {
        withCredentials: true,
    });

    return response.data;
};

export const fetchSlotsOccupiedForEvent = async (eventId) => {
    console.log("in api, eventId:", eventId)
    const response = await API.get(`/api/participants/occupied-slots?eventId=${eventId}`, {
        withCredentials: true,
    });

    return response.data;
};


export const fetchParticipantsByEventIdAndCollegeId = async (eventId, collegeId) => {
    const response = await API.get(`/api/participants/college-event?eventId=${eventId}&collegeId=${collegeId}`, {
        withCredentials: true
    });

    return response.data;
};

export const updateParticipant = async (participant) => {
    console.log("in api, participant:", participant);
    const response = await API.put(`/api/participants/${participant?.id}`, participant, {
        withCredentials: true,
    });

    return response.data;
};

export const deleteParticipant = async (id) => {
    const response = await API.delete(`/api/participants/${id}`, {
        withCredentials: true,
    });

    return response.data;
};

export const disableParticipation = async (group, eventId, status) => {
    const response = await API.get(`/api/participants/disable-participation?group=${group}&status=${status}&eventId=${eventId}`, {
        withCredentials: true
    });

    return response.data;
};
