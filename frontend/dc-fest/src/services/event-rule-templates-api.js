import { API } from "../utils/api";

export const fetchEventTemplateRules = async () => {
    const response = await API.get(`/api/event-rule-templates`, {
        withCredentials: true
    });
    
    return response.data;
};