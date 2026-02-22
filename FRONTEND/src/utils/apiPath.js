export const BASE_URL = "http://localhost:5001/api";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GET_PROFILE: "/auth/profile",
    UPDATE_PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  DOCUMENT: {
    UPLOAD: "/documents/upload",
    GET_ALL: "/documents",
    GET_DOCUMENT_BY_ID: (id) => `/documents/${id}`,
    UPDATE_DOCUMENT: (id) => `/documents/${id}`,
    DELETE_DOCUMENT: (id) => `/documents/${id}`,
  },

  AI: {
    GENERATE_FLASHCARDS: "/ai/generate-flashcards",
    GENERATE_QUIZ: "/ai/generate-quiz",
    GENERATE_SUMMARY: "/ai/generate-summary",
    CHAT: "/ai/chat",
    EXPLAIN_CONCEPT: "/ai/explain-concept",
    GET_CHAT_HISTORY: (documentId) => `/ai/chat-history/${documentId}`,
  },

  FLASHCARD: {
    GET_ALL_SETS: "/flashcard",
    GET_FLASHCARD_BY_DOCUMENT: (documentId) => `/flashcard/${documentId}`,
    REVIEW: (cardId) => `/flashcard/${cardId}/review`,
    TOGGLE_STAR: (cardId) => `/flashcard/${cardId}/star`,
    DELETE_FLASHCARD: (id) => `/flashcard/${id}`,
  },

  QUIZ: {
    GET_QUIZ_BY_DOCUMENT: (documentId) => `/quiz/document/${documentId}`,
    GET_QUIZ_BY_ID: (id) => `/quiz/${id}`,
    SUBMIT_QUIZ: (id) => `/quiz/${id}/submit`,
    GET_QUIZ_RESULTS: (id) => `/quiz/${id}/results`,
    DELETE_QUIZ: (id) => `/quiz/${id}`,
  },

  PROGRESS: {
    GET_DASHBOARD: "/progress/dashboard",
  },
};
