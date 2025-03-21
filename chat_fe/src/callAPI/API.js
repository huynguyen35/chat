// This is class for API calls

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/';

export const signUp = async (data) => {
    try {
        const response = await axios.post(API_URL + 'auth/register', data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        return response.data;
    } catch (error) {
        throw error.response || 'Đang có lỗi xảy ra, vui lòng thử lại sau';
    }
}

export const login = async (data) => {
    try {
        const response = await axios.post(API_URL + "auth/login", data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data
    } catch (error) {
        throw error.response || "Đang có lỗi xảy ra, vui lòng thử lại sau";
    }
};
