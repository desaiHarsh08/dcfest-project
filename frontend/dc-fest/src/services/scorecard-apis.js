import { API } from "../utils/api";

export const getScoreCardSheet = async (availableEventId, roundId) => {
    const response = await API.get(`/api/scorecards/get-scorecard-sheet?availableEventId=${availableEventId}&roundId=${roundId}`, {
        withCredentials: true,
        responseType: 'arraybuffer',
    });

    return response.data;
};

export const getAllScoreCards = async () => {
    const response = await API.get(`/api/scorecards`, {
        withCredentials: true,
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

export const updateTeam = async (scorecard) => {
    const response = await API.put(`/api/scorecards/${scorecard.id}`, scorecard, {
        withCredentials: true,
        responseType: 'arraybuffer',
    });

    return response.data;
};

export const getScoreCardTeamByTeamNumberAndRoundId = async (teamNumber, roundId) => {
    const response = await API.get(`/api/scorecards/team-round?teamNumber=${teamNumber}&roundId=${roundId}`, {
        withCredentials: true,
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
