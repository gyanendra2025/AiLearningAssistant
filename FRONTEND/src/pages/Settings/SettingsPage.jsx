import React, { useState, useEffect } from 'react';
import { Key, Trash2, CheckCircle, Plus, Eye, EyeOff, Zap, BrainCircuit, Shield, ExternalLink } from 'lucide-react';
import { settingsService } from '../../Service/settingsService';
import Button from '../../components/common/button';
import toast from 'react-hot-toast';

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '✦',
    color: 'from-blue-500 to-cyan-400',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    dashboardUrl: 'https://aistudio.google.com/apikey',
    description: 'Gemini 2.0 Flash — fast & affordable',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '⬡',
    color: 'from-emerald-500 to-teal-400',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    dashboardUrl: 'https://platform.openai.com/api-keys',
    description: 'GPT-4o Mini — powerful & versatile',
  },
];

const SettingsPage = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Load keys
  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getApiKeys();
      setKeys(data.data || []);
    } catch (error) {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      toast.error('Please enter your API key');
      return;
    }
    setSaving(true);
    try {
      await settingsService.saveApiKey(selectedProvider, apiKeyInput.trim(), labelInput.trim());
      toast.success('API key saved successfully!');
      setApiKeyInput('');
      setLabelInput('');
      setShowAddForm(false);
      loadKeys();
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (id) => {
    if (!confirm('Delete this API key?')) return;
    try {
      await settingsService.deleteApiKey(id);
      toast.success('API key deleted');
      loadKeys();
    } catch (error) {
      toast.error('Failed to delete key');
    }
  };

  const handleActivateKey = async (id) => {
    try {
      await settingsService.activateApiKey(id);
      toast.success('API key activated!');
      loadKeys();
    } catch (error) {
      toast.error('Failed to activate key');
    }
  };

  const activeKey = keys.find((k) => k.isActive);
  const activeProvider = PROVIDERS.find((p) => p.id === activeKey?.provider);

  const inputClass =
    'w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-300';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
          Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your AI provider API keys
        </p>
      </div>

      {/* Active Provider Banner */}
      {activeKey && activeProvider && (
        <div
          className={`bg-gradient-to-r ${activeProvider.color} rounded-2xl p-5 text-white shadow-lg`}
          style={{ animation: 'fadeInUp 0.4s ease-out' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                {activeProvider.icon}
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                  Active Provider
                </p>
                <h3 className="text-lg font-bold">{activeProvider.name}</h3>
                <p className="text-white/80 text-xs">{activeKey.maskedKey}</p>
              </div>
            </div>
            <a
              href={activeProvider.dashboardUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-medium bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg transition-all"
            >
              Dashboard <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* No Key Warning */}
      {!loading && keys.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">
              No API key configured
            </h4>
            <p className="text-xs text-amber-600 mt-1">
              You need to add an API key to use AI features like Chat, Flashcards,
              Quiz, and Summary. Get a free Gemini key from{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="underline font-medium"
              >
                Google AI Studio
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Key className="w-5 h-5 text-indigo-500" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">API Keys</h3>
              <p className="text-xs text-gray-400">
                {keys.length} key{keys.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>
          {!showAddForm && (
            <Button
              size="sm"
              icon={Plus}
              onClick={() => setShowAddForm(true)}
            >
              Add Key
            </Button>
          )}
        </div>

        {/* Saved Keys */}
        {keys.length > 0 && (
          <div className="space-y-3 mb-4">
            {keys.map((k) => {
              const provider = PROVIDERS.find((p) => p.id === k.provider);
              return (
                <div
                  key={k._id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    k.isActive
                      ? 'border-indigo-200 bg-indigo-50/50'
                      : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg ${provider?.bgLight || 'bg-gray-100'} flex items-center justify-center text-lg`}
                    >
                      {provider?.icon || '🔑'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {k.label || provider?.name}
                        </span>
                        {k.isActive && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-mono">
                        {k.maskedKey}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!k.isActive && (
                      <button
                        onClick={() => handleActivateKey(k._id)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all cursor-pointer"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteKey(k._id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Key Form */}
        {showAddForm && (
          <div
            className="border-t border-gray-100 pt-5 mt-4 space-y-4"
            style={{ animation: 'fadeInUp 0.3s ease-out' }}
          >
            <h4 className="text-sm font-bold text-gray-700">Add New API Key</h4>

            {/* Provider Selection */}
            <div className="grid grid-cols-2 gap-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selectedProvider === p.id
                      ? 'border-indigo-400 bg-indigo-50/60 ring-4 ring-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-sm font-bold text-gray-800">
                      {p.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{p.description}</p>
                </button>
              ))}
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Label (optional)
              </label>
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                className={inputClass}
                placeholder="e.g. My Gemini Key"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className={`${inputClass} pr-11`}
                  placeholder={
                    selectedProvider === 'gemini'
                      ? 'AIza...'
                      : 'sk-...'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-300 mt-1.5">
                Your key is encrypted before storage. We never store it in
                plaintext.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setApiKeyInput('');
                  setLabelInput('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveKey}
                loading={saving}
                icon={Key}
              >
                Save Key
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-violet-500" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Provider Dashboards</h3>
            <p className="text-xs text-gray-400">View usage and manage keys on provider sites</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PROVIDERS.map((p) => (
            <a
              key={p.id}
              href={p.dashboardUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-3 p-4 rounded-xl ${p.bgLight} hover:shadow-md transition-all group`}
            >
              <span className="text-xl">{p.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${p.textColor}`}>
                  {p.name}
                </p>
                <p className="text-[11px] text-gray-400 group-hover:text-gray-500">
                  Open dashboard →
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
