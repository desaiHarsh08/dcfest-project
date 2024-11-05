import { API } from "../utils/api";

export const fetchAvailableEventsById = async (id) => {
    const response = await API.get(`/api/available-events/${id}`, {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};

export const fetchAvailableEvents = async () => {
    const response = await API.get(`/api/available-events`, {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};
export const fetchAvailableEventsBySlug = async (slug) => {
    const response = await API.get(`/api/available-events/slug/${slug}`, {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};