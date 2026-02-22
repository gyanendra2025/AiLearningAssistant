import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const login = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const register = async (username, email, password) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getProfile = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.UPDATE_PROFILE,
      profileData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.AUTH.CHANGE_PASSWORD,
      passwordData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
};
