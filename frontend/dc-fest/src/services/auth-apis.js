import { API } from "../utils/api";

export const doLogin = async ({ username, password }) => {
    const response = await API.post('/auth/login', { username, password }, {

        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true
    });
    
    return response.data;
};

export const fetchUsers = async (page) => {
    const response = await API.get(`/api/users?page=${page}`, {
        withCredentials: true
    });
    
    return response.data;
};

export const createUser = async (user) => {
    const response = await API.post(`/auth`, user, {
        headers:{
            "Content-Type":"application/json",
        },
        withCredentials: true,
        
    });
    
    return response.data;
};
export const generateOTP = async (otpObj) => {
    const response = await API.post(`/auth/generate-otp`, otpObj, {
        headers:{
            "Content-Type":"application/json",
        },
        withCredentials: true,
        
    });
    
    return response.data;
};
export const verifyOTP = async (verifyObj) => {
    const response = await API.post(`/auth/verify-otp`, verifyObj, {
        headers:{
            "Content-Type":"application/json",
        },
        withCredentials: true,
        
    });
    
    return response.data;
};
