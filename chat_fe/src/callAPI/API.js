// src/api/apiService.js

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/';

// Tạo instance với cấu hình sẵn
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 🔥 Cho phép gửi cookie kèm request
});

// Hàm đăng ký
export const signUp = async (data) => {
    try {
        const response = await axiosInstance.post('auth/register', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Đang có lỗi xảy ra, vui lòng thử lại sau';
    }
};

// Hàm đăng nhập
export const login = async (data) => {
    try {
        const response = await axiosInstance.post('auth/login', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Đang có lỗi xảy ra, vui lòng thử lại sau';
    }
};

// Lấy danh sách cuộc trò chuyện của user
export const fetchConversation = async (userId) => {
    try {
        const response = await axiosInstance.get(`conversation/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Đang có lỗi xảy ra, vui lòng thử lại sau';
    }
};

// Cập nhật avatar người dùng
export const updateAvt = async (userId, url) => {
    try {
        const response = await axiosInstance.put(`user/update-image/${userId}?avt=${encodeURIComponent(url)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Đang có lỗi xảy ra, vui lòng thử lại sau';
    }
};

// Lấy danh sách thoong báo
export const fetchNotification = async (userId) => {
    try {
        const response = await axiosInstance.get(`notification/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || 'Đang có lỗi xảy ra, vui lòng thử lại sau';
    }
};

// Lấy chats
export const fetchChats = async (chatId) => {
    try {
        const response = await axiosInstance.get(`message/${chatId}`);
        return response;
    } catch (error) {
        throw error.response?.data || 'Đang có lỗi xảy ra, vui lòng thử lại sau';
    }
};




