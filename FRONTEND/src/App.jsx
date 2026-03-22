import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Auth Components
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

// Protected Route Component
import ProtectedRoute from "./components/auth/protectedRoute";

// Dashboard Components
import DashboardPage from "./pages/Dashboard/DashboardPage";

// Document Components
import DocumentListPage from "./pages/Documents/DocumentListPage";
import DocumentDetailPage from "./pages/Documents/DocumentDetailPage";

// Flashcard Components
import FlashcardListPage from "./pages/Flashcards/FlashcardListPage";
import FlashcardPage from "./pages/Flashcards/FlashcardPage";

// Quiz Components
import QuizTakePage from "./pages/Quizzes/QuizTakePage";
import QuizResultPage from "./pages/Quizzes/QuizResultPage";

// Profile Component
import ProfilePage from "./pages/Profile/ProfilePage";

// Settings Components
import SettingsPage from "./pages/Settings/SettingsPage";
import UsagePage from "./pages/Settings/UsagePage";

// Analytics
import AnalyticsPage from "./pages/Analytics/AnalyticsPage";

// Study Sessions & Groups
import StudySessionPage from "./pages/StudySession/StudySessionPage";
import GroupsPage from "./pages/Groups/GroupsPage";

import { useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes with application layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentListPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/flashcards" element={<FlashcardListPage />} />
            <Route path="/flashcards/:id" element={<FlashcardPage />} />
            <Route
              path="/documents/:id/flashcards"
              element={<FlashcardListPage />}
            />
            <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
            <Route
              path="/quizzes/:quizId/results"
              element={<QuizResultPage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/usage" element={<UsagePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/study-sessions" element={<StudySessionPage />} />
            <Route path="/groups" element={<GroupsPage />} />
          </Route>
        </Route>

        {/* 404 — must be LAST */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
