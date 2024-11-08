import { API } from "../utils/api";

export const fetchParticipationEvents = async () => {
    const response = await API.get('/api/participations', {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};

export const fetchParticipationEventsByCollegeId = async (collegeId) => {
    const response = await API.get(`/api/participations/college/${collegeId}`, {
        withCredentials: true
    });
    console.log(response)
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
    console.log(response)
    return response.data;
};
