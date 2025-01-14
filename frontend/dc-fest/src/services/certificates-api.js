import { API } from "../utils/api";

export const generateCertificates = async (obj) => {
    const response = await API.post('/api/certificates/generate', obj, {
        headers: {
            "Accept": "application/pdf"
        },
        withCredentials: true, // Combine the config object
        responseType: 'arraybuffer',
    });

    return response.data;
};
