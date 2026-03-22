import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, BrainCircuit, Loader2, X } from 'lucide-react';
import { quizService } from '../../Service/quizService';
import { aiService } from '../../Service/aiService';
import QuizCard from './QuizCard';
import Button from '../common/button';
import toast from 'react-hot-toast';

const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Fetch quizzes
  const fetchQuizzes = async () => {
    try {
      const data = await quizService.getQuizzesByDocument(documentId);
      setQuizzes(data.quizzes || data || []);
    } catch (error) {
      console.log('No quizzes yet:', error.message);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [documentId]);

  // Generate quiz
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId);
      toast.success('Quiz generated successfully!');
      fetchQuizzes();
    } catch (error) {
      toast.error(error.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  // Delete
  const openDeleteModal = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success('Quiz deleted');
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // Empty state
  if (quizzes.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
          <BrainCircuit className="w-8 h-8 text-violet-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No quizzes yet</h3>
        <p className="text-sm text-gray-400 mb-5">Generate an AI-powered quiz to test your knowledge</p>
        <Button onClick={handleGenerate} loading={generating} icon={Sparkles}>
          {generating ? 'Generating...' : 'Generate Quiz'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-violet-500" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                {quizzes.length} Quiz{quizzes.length !== 1 ? 'zes' : ''}
              </h3>
              <p className="text-xs text-gray-400">Test your understanding</p>
            </div>
          </div>
          <Button size="sm" onClick={handleGenerate} loading={generating} icon={Sparkles}>
            Generate New Quiz
          </Button>
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz._id}
            quiz={quiz}
            onDelete={openDeleteModal}
          />
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
            style={{ animation: 'fadeInUp 0.3s ease-out' }}
          >
            <button
              onClick={() => { setIsDeleteModalOpen(false); setSelectedQuiz(null); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" strokeWidth={1.8} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 text-center mb-1">Delete Quiz?</h2>
            <p className="text-sm text-gray-400 text-center mb-1">
              "{selectedQuiz?.title || 'Quiz'}" will be permanently deleted.
            </p>
            <p className="text-xs text-red-400 text-center mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setIsDeleteModalOpen(false); setSelectedQuiz(null); }} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} loading={deleting} icon={Trash2} className="flex-1">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default QuizManager;
