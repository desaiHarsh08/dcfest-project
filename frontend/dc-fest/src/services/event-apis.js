import { API } from "../utils/api";

export const fetchEventsByCategory = async (categorySlug) => {
    const response = await API.get(`/api/available-events/category/${categorySlug}`, {
        withCredentials: true
    });

    return response.data;
};

export const fetchEventBySlug = async (eventSlug, includeInactive = false) => {
    const response = await API.get(`/api/available-events/slug/${eventSlug}?includeInactive=${includeInactive}`, {
        withCredentials: true
    });

    return response.data;
};

export const fetchEventById = async (id, signal = null) => {
    const config = {
        withCredentials: true
    };
    if (signal) {
        config.signal = signal;
    }
    const response = await API.get(`/api/events/${id}`, config);

    return response.data;
};


export const fetchEventByAvailableEventId = async (availableEventId) => {
    const response = await API.get(`/api/events/available-event/${availableEventId}`, {
        withCredentials: true
    });

    return response.data;
};
export const fetchEvents = async () => {
    const response = await API.get(`/api/events`, {
        withCredentials: true
    });

    return response.data;
};
