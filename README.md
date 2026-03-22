# 🧠 AI Learning Assistant

Welcome to the **AI Learning Assistant**! This is a smart study companion designed to help you learn faster and retain more information. By combining the power of AI (Gemini/OpenAI) with scientifically proven learning methods like Spaced Repetition, this tool transforms your boring documents into interactive study sessions.

---

## ✨ Features

Here’s what you can do with it:

- 📄 **Smart Document Processing**: Upload PDFs, Word documents (DOCX), or Text files. The app automatically extracts the text and splits it into manageable, "smart" chunks using RAG (Retrieval-Augmented Generation) vector embeddings for super accurate semantic search.
- 💬 **Multi-Document Chat**: Have a conversation with your documents! Select multiple study materials at once and ask questions. The AI will find the exact context across your files and give you accurate answers with source references.
- 🎴 **AI Flashcards & Spaced Repetition**: Generate flashcards instantly from your notes. As you study, the built-in **SM-2 Spaced Repetition Algorithm** tracks how well you know each card (Rate 1-5) and schedules your next review exactly when your brain is about to forget it.
- 📝 **Intelligent Quizzes**: Test your knowledge by having the AI generate multiple-choice quizzes complete with explanations for the correct answers. 
- 📊 **Analytics Dashboard**: Keep track of your learning journey. View your study streak, flashcard mastery (New/Learning/Mastered), activity heatmaps, and quiz score trends in beautiful charts.
- 👥 **Collaborative Study Groups**: Create or join study groups using invite codes. Share your documents, flashcards, and quizzes with your friends or classmates.
- 📥 **Export Anywhere**: Export your flashcards to Anki, CSV, or JSON. Download your quiz results as Markdown or JSON.
- 🌙 **Dark Mode**: Because studying at 2 AM is real. Toggle a beautiful dark interface at any time.

---

## 🚀 How to Use It

### 1. Setup Your API Key
The AI features require an API key to work. 
1. Log in to the application.
2. Go to **Settings** in the sidebar.
3. Enter your **Google Gemini** or **OpenAI** API key. 
4. *Don't worry, your key is encrypted to the highest AES-256 standard before being safely stored in the database.*

### 2. Upload Your Notes
Head over to the **Documents** page and click "Upload Document". Drop your PDF or DOCX file there. Wait a few seconds while it extracts the text and creates vector embeddings.

### 3. Start Studying!
Once your document is ready, click on it, and you have three superpowers:
- **Chat**: Ask it to explain complex concepts or summarize the entire text.
- **Generate Flashcards**: Tell it to create 10 flashcards, then go to the Flashcards page to review them.
- **Generate Quiz**: Tell it to create a 5-question test to see what you remember.

### 4. Join a Group
Go to the **Groups** page, click "Create", and share the invite code with your friends. Once they join, you can click "Share" on any of your documents or flashcards to make them available to the whole group.

---

## 💻 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, React Router, Recharts (for analytics), Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO (ready).
- **AI Integration**: Google Generative AI (Gemini), OpenAI, Vector Embeddings + Cosine Similarity.
- **Security**: JWT Authentication, AES-256-GCM Encryption for API keys.

---

*Built for learners, by a learner.* Enjoy! 🚀