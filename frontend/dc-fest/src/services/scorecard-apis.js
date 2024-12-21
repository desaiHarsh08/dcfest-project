import { API } from "../utils/api";

export const getScoreCardSheet = async (availableEventId, roundId) => {
    const response = await API.get(`/api/scorecards/get-scorecard-sheet?availableEventId=${availableEventId}&roundId=${roundId}`, {
        withCredentials: true,
        responseType: 'arraybuffer',
    });

    return response.data;
};

export const handlePromoteTeam = async (scorecard) => {
    const response = await API.post(`/api/scorecards/promote-team`, scorecard, {
        withCredentials: true,
        responseType: 'arraybuffer',
    });

    return response.data;
};

export const getCollegeParticipationForScoreCard = async (availableEventId, roundId) => {
    console.log('fetching getCollegeParticipationForScoreCard()')
    const response = await API.get(`/api/scorecards/get-college-participations?availableEventId=${availableEventId}&roundId=${roundId}`, {
        withCredentials: true,
    });

    console.log("in apicall: ", response.data)

    return response.data;
};
