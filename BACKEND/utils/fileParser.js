import { readFile } from "node:fs/promises";
import path from "path";
import { extractTextFromPDF } from "./pdfParser.js";

/**
 * Extract text from a file based on its extension.
 * Supports: PDF, TXT, MD, CSV, DOC/DOCX (basic), PPT/PPTX (basic)
 *
 * @param {string} filePath - absolute path to the uploaded file
 * @param {string} originalName - original file name with extension
 * @returns {Promise<{ text: string, numPages: number }>}
 */
export const extractTextFromFile = async (filePath, originalName) => {
  const ext = path.extname(originalName || filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return extractTextFromPDF(filePath);

    case ".txt":
    case ".md":
    case ".csv": {
      const content = await readFile(filePath, "utf-8");
      return { text: content, numPages: 1 };
    }

    case ".doc":
    case ".docx": {
      // Try mammoth for DOCX extraction
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ path: filePath });
        return { text: result.value || "", numPages: 1 };
      } catch (err) {
        // If mammoth is not installed, read raw and try best effort
        console.warn("mammoth not installed, falling back to raw text read for DOCX:", err.message);
        const content = await readFile(filePath, "utf-8").catch(() => "");
        return {
          text: content || "[DOCX extraction requires mammoth package. Install with: npm i mammoth]",
          numPages: 1,
        };
      }
    }

    case ".ppt":
    case ".pptx": {
      // Try officeparser for PPT extraction
      try {
        const officeparser = await import("officeparser");
        const text = await officeparser.parseOfficeAsync(filePath);
        return { text: text || "", numPages: 1 };
      } catch (err) {
        console.warn("officeparser not installed, cannot extract PPT:", err.message);
        return {
          text: "[PPT extraction requires officeparser package. Install with: npm i officeparser]",
          numPages: 1,
        };
      }
    }

    default:
      // Try reading as plain text as a last resort
      try {
        const content = await readFile(filePath, "utf-8");
        return { text: content, numPages: 1 };
      } catch {
        return { text: "", numPages: 0 };
      }
  }
};
