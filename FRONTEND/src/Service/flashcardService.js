import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const getAllFlashcardSets = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.FLASHCARD.GET_ALL_SETS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getFlashcardsByDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARD.GET_FLASHCARD_BY_DOCUMENT(documentId),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const reviewFlashcard = async (cardId, reviewData) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.FLASHCARD.REVIEW(cardId),
      reviewData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const toggleStarFlashcard = async (cardId) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.FLASHCARD.TOGGLE_STAR(cardId),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteFlashcardSet = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.FLASHCARD.DELETE_FLASHCARD(id),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const flashcardService = {
  getAllFlashcardSets,
  getFlashcardsByDocument,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
};
