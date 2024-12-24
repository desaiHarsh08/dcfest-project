import { API } from "../utils/api";

export const fetchParticipationById = async (id) => {
    console.log("in api for fetchParticipationById, id:", id)
    const response = await API.get(`/api/participations/${id}`, {
        withCredentials: true
    });
    console.log('res of fetchParticipationById(), ', response.data);

    return response.data;
};

export const fetchParticipationEvents = async () => {
    const response = await API.get('/api/participations', {
        withCredentials: true
    });

    return response.data;
};

export const fetchParticipationEventsByCollegeId = async (collegeId) => {
    const response = await API.get(`/api/participations/college/${collegeId}`, {
        withCredentials: true
    });

    return response.data;
};

export const fetchParticipationByCollegeIdAndAvailableEventId = async (collegeId, availableEventId) => {
    const response = await API.get(`/api/participations/college/${collegeId}/available-event/${availableEventId}`, {
        withCredentials: true
    });

    return response.data;
};

export const doParticipate = async (collegeParticiption) => {
    console.log('registering college event :', collegeParticiption)
    const response = await API.post('/api/participations', collegeParticiption, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    });

    return response.data;
};

export const interestedColleges = async () => {
    const response = await API.get('/api/participations/interested-colleges', {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    });

    return response.data;
};

export const fetchAllParticipations = async () => {
    const response = await API.get('/api/participations', {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    });

    return response.data;
};

export const fetchParticipationsByAvailableEventId = async (availableEventId) => {
    const response = await API.get(`/api/participations/available-event/${availableEventId}`, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    });

    return response.data;
};

export const deleteParticipation = async (collegeParticiptionId) => {
    const response = await API.delete(`/api/participations/${collegeParticiptionId}`, {
        withCredentials: true
    });

    return response.data;
};