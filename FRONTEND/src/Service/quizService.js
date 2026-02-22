import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const getQuizzesByDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZ.GET_QUIZ_BY_DOCUMENT(documentId),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getQuizById = async (id) => {
  try {
    const response = await axiosInstance.get(API_PATHS.QUIZ.GET_QUIZ_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

const submitQuiz = async (id, answers) => {
  try {
    const response = await axiosInstance.post(API_PATHS.QUIZ.SUBMIT_QUIZ(id), {
      answers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getQuizResults = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.QUIZ.GET_QUIZ_RESULTS(id),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteQuiz = async (id) => {
  try {
    const response = await axiosInstance.delete(API_PATHS.QUIZ.DELETE_QUIZ(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const quizService = {
  getQuizzesByDocument,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
};
