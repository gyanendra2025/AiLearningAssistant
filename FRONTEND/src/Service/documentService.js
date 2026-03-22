import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const uploadDocument = async (file, title) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (title) {
      formData.append("title", title);
    }
    const response = await axiosInstance.post(
      API_PATHS.DOCUMENT.UPLOAD,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getDocuments = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENT.GET_ALL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getDocumentById = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.DOCUMENT.GET_DOCUMENT_BY_ID(id),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateDocument = async (id, documentData) => {
  try {
    const response = await axiosInstance.put(
      API_PATHS.DOCUMENT.UPDATE_DOCUMENT(id),
      documentData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteDocument = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.DOCUMENT.DELETE_DOCUMENT(id),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const documentService = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};
