import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle, XCircle, ArrowLeft, RotateCcw, Home, BrainCircuit } from 'lucide-react';
import { quizService } from '../../Service/quizService';
import Spinner from '../../components/common/spinner';
import Button from '../../components/common/button';
import toast from 'react-hot-toast';

const QuizResultPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [resultData, quizData] = await Promise.all([
          quizService.getQuizResults(quizId),
          quizService.getQuizById(quizId),
        ]);
        setResult(resultData.result || resultData.results || resultData);
        setQuiz(quizData.quiz || quizData);
      } catch (error) {
        toast.error('Failed to load results');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [quizId]);

  if (loading) return <Spinner fullScreen />;
  if (!result && !quiz) return null;

  const score = result?.score ?? quiz?.score ?? 0;
  const scorePercent = Math.round(score);
  const questions = quiz?.questions || result?.questions || [];
  const totalQ = questions.length;
  const correctCount = result?.correctAnswers ?? result?.correct ?? Math.round((score / 100) * totalQ);
  const incorrectCount = totalQ - correctCount;

  const getGrade = (s) => {
    if (s >= 90) return { label: 'Excellent!', emoji: '🏆', color: 'text-green-600', bg: 'from-green-400 to-emerald-500' };
    if (s >= 75) return { label: 'Great Job!', emoji: '🌟', color: 'text-blue-600', bg: 'from-blue-400 to-indigo-500' };
    if (s >= 50) return { label: 'Good Effort!', emoji: '👍', color: 'text-amber-600', bg: 'from-amber-400 to-orange-500' };
    return { label: 'Keep Trying!', emoji: '💪', color: 'text-red-500', bg: 'from-red-400 to-rose-500' };
  };

  const grade = getGrade(scorePercent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Score Card */}
        <div
          className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl p-8 text-center"
          style={{ animation: 'fadeInUp 0.6s ease-out' }}
        >
          {/* Big score circle */}
          <div className="relative w-32 h-32 mx-auto mb-5">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${scorePercent * 2.64} 264`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-gray-800">{scorePercent}%</span>
            </div>
          </div>

          <p className="text-3xl mb-1">{grade.emoji}</p>
          <h2 className={`text-xl font-bold ${grade.color} mb-1`}>{grade.label}</h2>
          <p className="text-sm text-gray-400">
            You answered {correctCount} out of {totalQ} questions correctly
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 mt-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={2} />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-800">{correctCount}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Correct</p>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-400" strokeWidth={2} />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-800">{incorrectCount}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Incorrect</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="secondary" icon={RotateCcw} onClick={() => navigate(`/quizzes/${quizId}`)}>
              Retake Quiz
            </Button>
            <Button icon={ArrowLeft} onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>

        {/* Answer Review */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 px-1">Answer Review</h3>

          {questions.map((q, i) => {
            const userAnswer = result?.answers?.[i]?.selectedOption ?? result?.answers?.[i]?.answer;
            const correctAnswer = q.correctAnswer ?? q.correct ?? q.correctOption;
            const isCorrect = result?.answers?.[i]?.isCorrect ??
              (userAnswer !== undefined && userAnswer !== null &&
                (userAnswer === correctAnswer ||
                  (q.options && q.options[userAnswer] === q.options[correctAnswer])));

            return (
              <div
                key={i}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl border p-5 ${
                  isCorrect ? 'border-green-200' : 'border-red-200'
                }`}
              >
                {/* Question */}
                <div className="flex items-start gap-3 mb-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                  }`}>
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {q.question || q.text}
                  </p>
                </div>

                {/* Options review */}
                <div className="space-y-2 ml-10">
                  {(q.options || []).map((opt, optIdx) => {
                    const optText = typeof opt === 'string' ? opt : opt.text || opt.label || '';
                    const isUserChoice = userAnswer === optIdx || userAnswer === optText;
                    const isCorrectOpt = correctAnswer === optIdx || correctAnswer === optText;
                    const label = String.fromCharCode(65 + optIdx);

                    let classes = 'border-gray-100 bg-white text-gray-500';
                    if (isCorrectOpt) classes = 'border-green-300 bg-green-50 text-green-700 font-medium';
                    if (isUserChoice && !isCorrectOpt) classes = 'border-red-300 bg-red-50 text-red-600 line-through';

                    return (
                      <div key={optIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${classes}`}>
                        <span className="font-bold text-xs w-5">{label}.</span>
                        {optText}
                        {isCorrectOpt && <CheckCircle className="w-4 h-4 text-green-500 ml-auto flex-shrink-0" strokeWidth={2} />}
                        {isUserChoice && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" strokeWidth={2} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default QuizResultPage;