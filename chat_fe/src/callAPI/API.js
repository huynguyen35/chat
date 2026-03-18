// src/api/apiService.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Táº¡o instance vá»›i cáº¥u hÃ¬nh sáºµn
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // ðŸ”¥ Cho phÃ©p gá»­i cookie kÃ¨m request
});

// HÃ m Ä‘Äƒng kÃ½
export const signUp = async (data) => {
    try {
        const response = await axiosInstance.post('auth/register', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Äang cÃ³ lá»—i xáº£y ra, vui lÃ²ng thá»­ láº¡i sau';
    }
};

// HÃ m Ä‘Äƒng nháº­p
export const login = async (data) => {
    try {
        const response = await axiosInstance.post('auth/login', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Äang cÃ³ lá»—i xáº£y ra, vui lÃ²ng thá»­ láº¡i sau';
    }
};

// Láº¥y danh sÃ¡ch cuá»™c trÃ² chuyá»‡n cá»§a user
export const fetchConversation = async (userId) => {
    try {
        const response = await axiosInstance.get(`conversation/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Äang cÃ³ lá»—i xáº£y ra, vui lÃ²ng thá»­ láº¡i sau';
    }
};

// Cáº­p nháº­t avatar ngÆ°á»i dÃ¹ng
export const updateAvt = async (userId, url) => {
    try {
        const response = await axiosInstance.put(`user/update-image/${userId}?avt=${encodeURIComponent(url)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Äang cÃ³ lá»—i xáº£y ra, vui lÃ²ng thá»­ láº¡i sau';
    }
};

// Láº¥y danh sÃ¡ch thoong bÃ¡o
export const fetchNotification = async (userId) => {
    try {
        const response = await axiosInstance.get(`notification/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Äang cÃ³ lá»—i xáº£y ra, vui lÃ²ng thá»­ láº¡i sau';
    }
};

// Láº¥y chats
export const fetchChats = async (chatId) => {
    try {
        const response = await axiosInstance.get(`message/${chatId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Äang cÃ³ lá»—i xáº£y ra, vui lÃ²ng thá»­ láº¡i sau';
    }
};

// TÃ¬m kiáº¿m ngÆ°á»i dÃ¹ng theo tÃªn hoáº·c email
export const searchUsers = async (query, excludeId) => {
    try {
        const params = new URLSearchParams({ search: query });
        if (excludeId) {
            params.append("excludeId", excludeId);
        }
        const response = await axiosInstance.get(`user?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Äang cÃ³ lá»—i xáº£y ra, vui lÃ²ng thá»­ láº¡i sau';
    }
};

// Tạo hoặc lấy cuộc trò chuyện riêng tư giữa 2 user
export const accessPrivateConversation = async (user1Id, user2Id) => {
    try {
        const response = await axiosInstance.post('conversation/private', null, {
            params: { user1: user1Id, user2: user2Id },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Äang cÃ³ lá»—i xáº£y ra, vui lÃ²ng thá»­ láº¡i sau';
    }
};

