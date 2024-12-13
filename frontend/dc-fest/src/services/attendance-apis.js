import { API } from "../utils/api";

export const generateQrcode = async (collegeId, availableEventId, roundId, group) => {
    try {
        // Make the GET request to fetch the PDF data as a blob
        const response = await API.get(`/api/attendance/generate-qrcode?collegeId=${collegeId}&availableEventId=${availableEventId}&roundId=${roundId}&group=${group}`, {
            responseType: 'arraybuffer', // Make sure to set the responseType to 'arraybuffer' for binary data
            withCredentials: true
        });

        // Return the response data (which will be an ArrayBuffer representing the PDF)
        return response.data; // This will be an ArrayBuffer
    } catch (error) {
        console.error("Error generating QR code PDF:", error);
        throw error;
    }
};

export const getPop = async (collegeId, availableEventId, roundId, group) => {
    try {
        // Make the GET request to fetch the PDF data as a blob
        const response = await API.get(`/api/attendance/get-pop?collegeId=${collegeId}&availableEventId=${availableEventId}&roundId=${roundId}&group=${group}`, {
            responseType: 'arraybuffer', // Make sure to set the responseType to 'arraybuffer' for binary data
            withCredentials: true
        });

        // Return the response data (which will be an ArrayBuffer representing the PDF)
        return response.data; // This will be an ArrayBuffer
    } catch (error) {
        console.error("Error generating QR code PDF:", error);
        throw error;
    }
};


export const scanQrcode = async (qrData) => {
    const response = await API.get(`/api/attendance/scan-qrcode/${qrData}`, {
        withCredentials: true
    });

    return response.data;
};

export const markAttendanceForParticipant = async (roundId, collegeId, participantId) => {
    const response = await API.get(`/api/attendance/mark-attendance?roundId=${roundId}&collegeId=${collegeId}&participantId=${participantId}`, {
        withCredentials: true
    });

    return response.data;
};