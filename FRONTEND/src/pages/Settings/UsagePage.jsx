import React, { useState, useEffect } from 'react';
import { BarChart3, Zap, DollarSign, Clock, ChevronDown, ArrowUpRight, FileText, MessageSquare, Brain, BookOpen, Lightbulb } from 'lucide-react';
import { settingsService } from '../../Service/settingsService';
import toast from 'react-hot-toast';

const ACTION_LABELS = {
  chat: { label: 'Chat', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
  'generate-flashcards': { label: 'Flashcards', icon: BookOpen, color: 'text-violet-500', bg: 'bg-violet-50' },
  'generate-quiz': { label: 'Quiz', icon: Brain, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'generate-summary': { label: 'Summary', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
  'explain-concept': { label: 'Explain', icon: Lightbulb, color: 'text-rose-500', bg: 'bg-rose-50' },
};

const PERIOD_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
];

const UsagePage = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryRes, historyRes] = await Promise.all([
        settingsService.getUsageSummary(days),
        settingsService.getUsageHistory(days),
      ]);
      setSummary(summaryRes.data || null);
      setHistory(historyRes.data || []);
    } catch (error) {
      toast.error('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const formatCost = (cost) => {
    if (cost < 0.01) return `$${cost.toFixed(6)}`;
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens) => {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
    return tokens.toString();
  };

  const totals = summary?.totals || { totalCalls: 0, totalTokens: 0, totalCost: 0 };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Usage</h1>
          <p className="text-gray-400 text-sm mt-1">Track your AI API usage and costs</p>
        </div>

        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-indigo-300 transition-all cursor-pointer"
          >
            {PERIOD_OPTIONS.find((p) => p.value === days)?.label}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showPeriodDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setDays(opt.value);
                    setShowPeriodDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    days === opt.value
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Calls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-500" strokeWidth={1.8} />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Calls
            </p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? '—' : totals.totalCalls}
          </p>
        </div>

        {/* Total Tokens */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-violet-500" strokeWidth={1.8} />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Tokens
            </p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? '—' : formatTokens(totals.totalTokens)}
          </p>
        </div>

        {/* Estimated Cost */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" strokeWidth={1.8} />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Est. Cost
            </p>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? '—' : formatCost(totals.totalCost)}
          </p>
        </div>
      </div>

      {/* Provider Breakdown */}
      {summary?.byProvider && summary.byProvider.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4">By Provider</h3>
          <div className="space-y-3">
            {summary.byProvider.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {p._id === 'gemini' ? '✦' : '⬡'}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-gray-700 capitalize">
                      {p._id}
                    </span>
                    <p className="text-xs text-gray-400">
                      {p.totalCalls} calls · {p.successCount} success · {p.failedCount} failed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {formatCost(p.totalCost)}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {formatTokens(p.totalTokens)} tokens
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Recent Activity</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No activity yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Use AI features on your documents to see usage
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {history.map((entry, i) => {
              const actionInfo = ACTION_LABELS[entry.action] || {
                label: entry.action,
                icon: Zap,
                color: 'text-gray-500',
                bg: 'bg-gray-50',
              };
              const Icon = actionInfo.icon;
              return (
                <div
                  key={entry._id || i}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${actionInfo.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${actionInfo.color}`} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {actionInfo.label}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {entry.provider} · {entry.model || '—'} · {formatTokens(entry.totalTokens)} tokens
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600">
                      {formatCost(entry.estimatedCost)}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dashboard Links */}
      <div className="grid grid-cols-2 gap-4">
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-all group"
        >
          <span className="text-2xl">✦</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-700">
              Gemini Dashboard
            </p>
            <p className="text-[11px] text-blue-400">
              View real usage on Google AI Studio
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
        </a>
        <a
          href="https://platform.openai.com/usage"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-all group"
        >
          <span className="text-2xl">⬡</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700">
              OpenAI Dashboard
            </p>
            <p className="text-[11px] text-emerald-400">
              View real usage on OpenAI Platform
            </p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600" />
        </a>
      </div>
    </div>
  );
};

export default UsagePage;
