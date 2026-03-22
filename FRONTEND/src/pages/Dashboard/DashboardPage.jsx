import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/common/spinner';
import { progressService } from '../../Service/progressService';
import toast from 'react-hot-toast';
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Eye,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardStats();
        console.log('Dashboard data:', data);
        setDashboardData(data);
      } catch (error) {
        console.log('Using fallback data:', error.message);
        // Fallback data for development
        setDashboardData({
          overview: {
            totalDocuments: 0,
            totalFlashCards: 0,
            totalQuizzes: 0,
          },
          recentDocuments: [],
          recentQuizzes: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spinner fullScreen />;
  }

  const overview = dashboardData?.overview || {};
  const recentDocuments = dashboardData?.recentDocuments || [];
  const recentQuizzes = dashboardData?.recentQuizzes || [];

  const stats = [
    {
      label: 'Total Documents',
      value: overview.totalDocuments ?? 0,
      icon: FileText,
      gradient: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
      iconColor: 'text-blue-500',
      shadowColor: 'shadow-blue-200/50',
    },
    {
      label: 'Total Flashcards',
      value: overview.totalFlashCards ?? 0,
      icon: BookOpen,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      iconColor: 'text-amber-500',
      shadowColor: 'shadow-amber-200/50',
    },
    {
      label: 'Total Quizzes',
      value: overview.totalQuizzes ?? 0,
      icon: BrainCircuit,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      iconColor: 'text-violet-500',
      shadowColor: 'shadow-violet-200/50',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-medium text-amber-500">Overview</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Track your learning progress at a glance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map(({ label, value, icon: Icon, gradient, bgLight, iconColor, shadowColor }) => (
          <div
            key={label}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 p-5 shadow-lg ${shadowColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${bgLight} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.8} />
              </div>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                <TrendingUp className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-indigo-100/30 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" strokeWidth={2} />
              <h2 className="font-semibold text-gray-700 text-sm">Recently Accessed Documents</h2>
            </div>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs text-indigo-500 font-semibold hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentDocuments.length > 0 ? (
              recentDocuments.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-400" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {doc.title || doc.filename || 'Untitled'}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/documents/${doc._id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Eye className="w-3 h-3" /> View
                  </button>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-gray-400">No documents yet</p>
                <p className="text-xs text-gray-300 mt-1">Upload your first document to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg shadow-indigo-100/30 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-violet-500" strokeWidth={2} />
              <h2 className="font-semibold text-gray-700 text-sm">Recently Attempted Quizzes</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {recentQuizzes.length > 0 ? (
              recentQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <BrainCircuit className="w-4 h-4 text-violet-400" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {quiz.title || 'Untitled Quiz'}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(quiz.updatedAt || quiz.createdAt).toLocaleDateString()}
                        {quiz.score !== undefined && (
                          <span className="ml-2 text-indigo-500 font-medium">
                            Score: {quiz.score}%
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/quizzes/${quiz._id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Eye className="w-3 h-3" /> View
                  </button>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <BrainCircuit className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm text-gray-400">No quizzes attempted</p>
                <p className="text-xs text-gray-300 mt-1">Take a quiz from any document</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;