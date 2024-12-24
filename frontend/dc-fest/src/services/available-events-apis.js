import { API } from "../utils/api";

export const fetchAvailableEventsById = async (id) => {
    const response = await API.get(`/api/available-events/${id}`, {
        withCredentials: true
    });
    
    return response.data;
};

export const fetchAvailableEvents = async () => {
    const response = await API.get(`/api/available-events`, {
        withCredentials: true
    });
    
    return response.data;
};
export const fetchAvailableEventsBySlug = async (slug) => {
    const response = await API.get(`/api/available-events/slug/${slug}`, {
        withCredentials: true
    });
    
    return response.data;
};

export const fetchAvailableEventsByCategorySlug = async (slug) => {
    const response = await API.get(`/api/available-events/category/${slug}`, {
        withCredentials: true
    });
    
    return response.data;
};

export const deleteAvailableEvent = async (id) => {
    const response = await API.delete(`/api/available-events/${id}`, {
        withCredentials: true
    });
    
    return response.data;
};

export const closeAvailableEvent = async (id) => {
    const response = await API.get(`/api/available-events/close-reg/${id}`, {
        withCredentials: true
    });
    
    return response.data;
};

export const updateAvailableEvent = async (availableEvent) => {
    const response = await API.put(`/api/available-events/${availableEvent.id}`, availableEvent, {
        withCredentials: true
    });
    
    return response.data;
};