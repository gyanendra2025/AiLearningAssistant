import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, PieChart as PieChartIcon, Activity, BookOpen, Brain, FileText, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axiosInstance from '../../utils/axiosInstance';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [streak, setStreak] = useState(null);
  const [quizTrends, setQuizTrends] = useState([]);
  const [flashcardStats, setFlashcardStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [o, s, q, f, h] = await Promise.all([
          axiosInstance.get('/api/analytics/overview'),
          axiosInstance.get('/api/analytics/study-streak'),
          axiosInstance.get('/api/analytics/quiz-trends'),
          axiosInstance.get('/api/analytics/flashcard-stats'),
          axiosInstance.get('/api/analytics/activity-heatmap'),
        ]);
        setOverview(o.data.data);
        setStreak(s.data.data);
        setQuizTrends(q.data.data);
        setFlashcardStats(f.data.data);
        setHeatmap(h.data.data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const pieData = flashcardStats ? [
    { name: 'Mastered', value: flashcardStats.mastered },
    { name: 'Learning', value: flashcardStats.learning },
    { name: 'New', value: flashcardStats.newCards },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your learning progress</p>
      </div>

      {/* Streak + Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-5 border border-orange-100 dark:border-orange-800/30">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide">Study Streak</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{streak?.currentStreak || 0} <span className="text-lg font-normal text-gray-500">days</span></p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Documents</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{overview?.documents || 0}</p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-emerald-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Flashcards</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{overview?.flashcards?.total || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{overview?.flashcards?.due || 0} due for review</p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Quiz Score</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{overview?.quizzes?.avgScore || 0}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Trends */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Quiz Performance</h2>
          </div>
          {quizTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={quizTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="title" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">Take a quiz to see trends</p>
          )}
        </div>

        {/* Flashcard Mastery Pie */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Flashcard Mastery</h2>
          </div>
          {pieData.length > 0 ? (
            <div className="flex items-center justify-center gap-8">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-12">Review flashcards to see mastery</p>
          )}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Activity (Last 90 Days)</h2>
        </div>
        <div className="flex flex-wrap gap-1">
          {heatmap.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} actions`}
              className="w-3 h-3 rounded-sm transition-colors"
              style={{
                background: day.count === 0 ? 'rgba(100,100,100,0.1)' :
                  day.count <= 2 ? '#c7d2fe' :
                  day.count <= 5 ? '#818cf8' :
                  '#4f46e5'
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span>Less</span>
          {['rgba(100,100,100,0.1)', '#c7d2fe', '#818cf8', '#4f46e5'].map((c) => (
            <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
