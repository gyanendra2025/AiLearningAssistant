import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

// ─── API Key Management ───

export const saveApiKey = async (provider, apiKey, label) => {
  try {
    const response = await axiosInstance.post(API_PATHS.SETTINGS.SAVE_API_KEY, {
      provider,
      apiKey,
      label,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getApiKeys = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.SETTINGS.GET_API_KEYS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteApiKey = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.SETTINGS.DELETE_API_KEY(id)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const activateApiKey = async (id) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.SETTINGS.ACTIVATE_API_KEY(id)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ─── Usage ───

export const getUsageHistory = async (days = 30) => {
  try {
    const response = await axiosInstance.get(
      `${API_PATHS.SETTINGS.GET_USAGE}?days=${days}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUsageSummary = async (days = 30) => {
  try {
    const response = await axiosInstance.get(
      `${API_PATHS.SETTINGS.GET_USAGE_SUMMARY}?days=${days}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const settingsService = {
  saveApiKey,
  getApiKeys,
  deleteApiKey,
  activateApiKey,
  getUsageHistory,
  getUsageSummary,
};
