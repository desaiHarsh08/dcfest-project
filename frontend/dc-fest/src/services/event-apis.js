import { API } from "../utils/api";

export const fetchEventsByCategory = async (categorySlug) => {
    const response = await API.get(`/api/available-events/category/${categorySlug}`, {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};

export const fetchEventBySlug = async (eventSlug) => {
    const response = await API.get(`/api/available-events/slug/${eventSlug}`, {
        withCredentials: true
    });
    console.log(response)
    return response.data;
};
