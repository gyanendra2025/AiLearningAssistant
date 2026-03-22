import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Clock, Trash2, Play, Trophy, HelpCircle } from 'lucide-react';
import moment from 'moment';

const QuizCard = ({ quiz, onDelete }) => {
  const navigate = useNavigate();

  const questionCount = quiz.questions?.length || quiz.questionCount || 0;
  const hasResult = quiz.score !== undefined && quiz.score !== null;
  const scorePercent = hasResult ? Math.round(quiz.score) : null;

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-200' };
    if (score >= 50) return { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200' };
    return { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-200' };
  };

  const handleStart = (e) => {
    e.stopPropagation();
    navigate(`/quizzes/${quiz._id}`);
  };

  const handleViewResult = (e) => {
    e.stopPropagation();
    navigate(`/quizzes/${quiz._id}/results`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(quiz);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative">
      {/* Delete */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
        title="Delete quiz"
      >
        <Trash2 className="w-4 h-4" strokeWidth={1.8} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
          <BrainCircuit className="w-5 h-5 text-violet-500" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-800 truncate pr-8">
            {quiz.title || 'Quiz'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              {questionCount} question{questionCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {moment(quiz.updatedAt || quiz.createdAt).fromNow()}
            </span>
          </div>
        </div>
      </div>

      {/* Score or Take */}
      {hasResult ? (
        <div className="space-y-3">
          {/* Score display */}
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${getScoreColor(scorePercent).bg} ring-1 ${getScoreColor(scorePercent).ring}`}>
            <div className="flex items-center gap-2">
              <Trophy className={`w-4 h-4 ${getScoreColor(scorePercent).text}`} strokeWidth={1.8} />
              <span className={`text-sm font-bold ${getScoreColor(scorePercent).text}`}>
                Score: {scorePercent}%
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {quiz.correctAnswers || 0}/{questionCount}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleViewResult}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" strokeWidth={2} />
              View Results
            </button>
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" strokeWidth={2} />
              Retake
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-200/50 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" strokeWidth={2} />
          Start Quiz
        </button>
      )}
    </div>
  );
};

export default QuizCard;
