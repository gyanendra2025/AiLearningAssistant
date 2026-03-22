import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BrainCircuit, ArrowLeft, ArrowRight, CheckCircle, Loader2, Clock, AlertCircle } from 'lucide-react';
import { quizService } from '../../Service/quizService';
import Button from '../../components/common/button';
import Spinner from '../../components/common/spinner';
import toast from 'react-hot-toast';

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await quizService.getQuizById(quizId);
        setQuiz(data.quiz || data);
      } catch (error) {
        toast.error('Failed to load quiz');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  if (loading) return <Spinner fullScreen />;
  if (!quiz) return null;

  const questions = quiz.questions || [];
  const totalQ = questions.length;
  const question = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQ > 0 ? (answeredCount / totalQ) * 100 : 0;

  // Select answer
  const handleSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQ]: optionIndex });
  };

  // Navigation
  const goNext = () => {
    if (currentQ < totalQ - 1) setCurrentQ(currentQ + 1);
  };
  const goPrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  // Submit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Format answers for API
      const formattedAnswers = questions.map((q, i) => ({
        questionIndex: i,
        questionId: q._id,
        selectedOption: answers[i] ?? -1,
        answer: answers[i] !== undefined ? (q.options?.[answers[i]] || answers[i]) : null,
      }));
      await quizService.submitQuiz(quizId, formattedAnswers);
      toast.success('Quiz submitted!');
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error(error.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-800">{quiz.title || 'Quiz'}</h1>
                <p className="text-xs text-gray-400">{totalQ} questions</p>
              </div>
            </div>
            <div className="text-sm font-semibold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg">
              {answeredCount}/{totalQ}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {question && (
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-6"
            style={{ animation: 'fadeInUp 0.3s ease-out' }}
            key={currentQ}
          >
            {/* Question number */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-violet-500 bg-violet-50 px-2.5 py-1 rounded-lg">
                Question {currentQ + 1} of {totalQ}
              </span>
            </div>

            {/* Question text */}
            <h2 className="text-base font-semibold text-gray-800 leading-relaxed mb-6">
              {question.question || question.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {(question.options || []).map((option, i) => {
                const isSelected = answers[currentQ] === i;
                const optionLabel = String.fromCharCode(65 + i); // A, B, C, D

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100/50 ring-2 ring-indigo-100'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {optionLabel}
                    </span>
                    <span className={`text-sm ${isSelected ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      {typeof option === 'string' ? option : option.text || option.label || ''}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-indigo-500 ml-auto flex-shrink-0" strokeWidth={2} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={currentQ === 0}
            icon={ArrowLeft}
          >
            Previous
          </Button>

          {/* Question dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  i === currentQ
                    ? 'bg-indigo-500 scale-125'
                    : answers[i] !== undefined
                    ? 'bg-indigo-200'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {currentQ < totalQ - 1 ? (
            <Button onClick={goNext} icon={ArrowRight}>
              Next
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (answeredCount < totalQ) {
                  setShowConfirm(true);
                } else {
                  handleSubmit();
                }
              }}
              loading={submitting}
              icon={CheckCircle}
            >
              Submit Quiz
            </Button>
          )}
        </div>

        {/* Unanswered confirmation modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-amber-500" strokeWidth={1.8} />
              </div>
              <h2 className="text-lg font-bold text-gray-800 text-center mb-1">Unanswered Questions</h2>
              <p className="text-sm text-gray-400 text-center mb-5">
                You have {totalQ - answeredCount} unanswered question{totalQ - answeredCount !== 1 ? 's' : ''}. Submit anyway?
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowConfirm(false)} className="flex-1">
                  Review
                </Button>
                <Button onClick={() => { setShowConfirm(false); handleSubmit(); }} loading={submitting} className="flex-1">
                  Submit
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
    </div>
  );
};

export default QuizTakePage;