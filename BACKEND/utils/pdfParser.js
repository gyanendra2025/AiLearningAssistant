import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pdfParseModule = require("pdf-parse");
const pdfParse = pdfParseModule.default || pdfParseModule;
/**
 * extract text from pdf file
 * @param {string} filepath- path to pdf file
 * @return {Promise<{text:string, numPages:number}>}
 */

export const extractTextFromPDF = async (filepath) => {
  try {
    const dataBuffer = await readFile(filepath);
    const data = await pdfParse(dataBuffer);

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (err) {
    console.error("PDF Parsing error:", err);
    throw new Error("Failed to extract text from PDF");
  }
};
