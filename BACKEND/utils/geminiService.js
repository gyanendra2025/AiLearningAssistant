import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

if (!process.env.GEMINI_API_KEY) {
  console.log("Please provide GEMINI_API_KEY in the .env file");
  process.exit(1);
}

export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate ${count} flashcards for the following text:
 Format each flashcard as:
 Q: [clear,specific question]
 A: [concise ,accurate answer]
 D: [Difficulty level: east, medium or hard]

 separate each flashcard with "--"

 Text:
 ${text.substring(0, 15000)} `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    const flashcards = [];
    const cards = generatedText.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          difficulty = line.substring(2).trim();
          if (["easy", "medium", "hard"].includes(difficulty)) {
            difficulty = difficulty;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }
    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
};

export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} mutiple choice questions for the following text: 
    Q: [Questions]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    A: [Answer]
    C: [Correct Option-exactly as written above]
    E:[Brief explanation]
    D:[Difficulty level: easy, medium or hard]

    seprate question with "--"

    Text:
    ${text.substring(0, 15000)} `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();
    const questions = [];
    const cards = generatedText.split("---").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        options = [],
        answer = "",
        explanation = "",
        difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("O1:")) {
          options.push(line.substring(3).trim());
        } else if (line.startsWith("O2:")) {
          options.push(line.substring(3).trim());
        } else if (line.startsWith("O3:")) {
          options.push(line.substring(3).trim());
        } else if (line.startsWith("O4:")) {
          options.push(line.substring(3).trim());
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("C:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("E:")) {
          explanation = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          difficulty = line.substring(2).trim();
          if (["easy", "medium", "hard"].includes(difficulty)) {
            difficulty = difficulty;
          }
        }
      }

      if (question && options.length >= 4 && answer) {
        questions.push({ question, options, answer, explanation, difficulty });
      }
    }
    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz");
  }
};

export const generateSummary = async (text) => {
  const prompt = `Generate a concise summary of the following text, highlighting the key concept, main ideas, and any important details. keep summary clear and structured:
    Text:   
    ${text.substring(0, 15000)} `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();
    return generatedText;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
};

export const chatWithContext = async (question, chunks) => {
  const context = chunks.map((chunk) => chunk.text).join("\n\n");

  console.log("content___", context);

  const prompt = `Based on the following context from a document, analyze the content and answer the user's question. If the answer is not in the context, say so.
    
    Context:
    ${context}
    
    Question: ${question}
    
    Answer:
    `;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();
    return generatedText;
  } catch (error) {
    console.error("Error generating chat with context:", error);
    throw new Error("Failed to generate chat with context");
  }
};

export const explainConcept = async (concept, chunks) => {
  const context = chunks.map((chunk) => chunk.text).join("\n\n");

  const prompt = `Explain the following concept in detail based on the following context:
    Provide a clear and educational explanation that is easy to understand and structured.
    Include examples if relevant.
    
    Context:
    ${context.substring(0, 15000)}
    
    Concept: ${concept}
    `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();
    return generatedText;
  } catch (error) {
    console.error("Error explaining concept:", error);
    throw new Error("Failed to explain concept");
  }
};
