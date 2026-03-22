import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF file
 * @param {string} filepath - path to pdf file
 * @return {Promise<{text: string, numPages: number}>}
 */
export const extractTextFromPDF = async (filepath) => {
  try {
    const parser = new PDFParse({ url: filepath });
    await parser.load();
    const text = await parser.getText();

    return {
      text: text || "",
      numPages: parser.doc?.numPages || 0,
      info: {},
    };
  } catch (err) {
    console.error("PDF Parsing error:", err);
    throw new Error("Failed to extract text from PDF");
  }
};
