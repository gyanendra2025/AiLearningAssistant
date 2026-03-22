import React, { useState, useEffect, useRef } from 'react';
import { Plus, MessageSquare, Trash2, FileText, Send, BookOpen, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const StudySessionPage = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    fetchDocuments();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.chatHistory]);

  const fetchSessions = async () => {
    try {
      const { data } = await axiosInstance.get('/api/study-session');
      setSessions(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data } = await axiosInstance.get('/api/documents');
      setDocuments(data.data?.documents || data.documents || data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const createSession = async () => {
    if (selectedDocs.length === 0) return toast.error('Select at least 1 document');
    try {
      const { data } = await axiosInstance.post('/api/study-session', {
        title: sessionTitle || undefined,
        documentIds: selectedDocs,
      });
      setSessions((prev) => [data.data, ...prev]);
      setActiveSession(data.data);
      setShowCreate(false);
      setSelectedDocs([]);
      setSessionTitle('');
      toast.success('Session created!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create session');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeSession) return;
    setSending(true);
    const userMsg = message;
    setMessage('');

    // Optimistic update
    setActiveSession((prev) => ({
      ...prev,
      chatHistory: [...(prev.chatHistory || []), { role: 'user', content: userMsg }],
    }));

    try {
      const { data } = await axiosInstance.post(`/api/study-session/${activeSession._id}/chat`, {
        message: userMsg,
      });
      setActiveSession((prev) => ({
        ...prev,
        chatHistory: [
          ...(prev.chatHistory || []),
          { role: 'assistant', content: data.data.answer, sources: data.data.sources },
        ],
      }));
    } catch (err) {
      toast.error('Failed to get response');
    } finally {
      setSending(false);
    }
  };

  const deleteSession = async (id) => {
    try {
      await axiosInstance.delete(`/api/study-session/${id}`);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      if (activeSession?._id === id) setActiveSession(null);
      toast.success('Session deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const toggleDoc = (docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // Active session chat view
  if (activeSession) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setActiveSession(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{activeSession.title}</h1>
            <p className="text-xs text-gray-400">{activeSession.documentIds?.length || 0} documents</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {(!activeSession.chatHistory || activeSession.chatHistory.length === 0) && (
            <div className="text-center py-16 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Start asking questions</p>
              <p className="text-sm">Your AI will search across all selected documents</p>
            </div>
          )}
          {activeSession.chatHistory?.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 space-y-1">
                    <p className="text-xs font-medium text-gray-400">Sources:</p>
                    {msg.sources.map((s, j) => (
                      <p key={j} className="text-xs text-gray-400">📄 {s.document}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask across your documents..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !message.trim()}
            className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Sessions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Chat across multiple documents at once</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Session
        </button>
      </div>

      {/* Create Session */}
      {showCreate && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
          <input
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            placeholder="Session title (optional)"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Select documents (max 5):</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {documents.map((doc) => (
              <label
                key={doc._id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedDocs.includes(doc._id)
                    ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700'
                    : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDocs.includes(doc._id)}
                  onChange={() => toggleDoc(doc._id)}
                  className="accent-indigo-500"
                />
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{doc.title}</span>
              </label>
            ))}
          </div>
          <button
            onClick={createSession}
            disabled={selectedDocs.length === 0}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            Create Session ({selectedDocs.length} docs)
          </button>
        </div>
      )}

      {/* Session List */}
      <div className="space-y-3">
        {sessions.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No study sessions yet</p>
            <p className="text-sm">Create a session to chat across multiple documents</p>
          </div>
        )}
        {sessions.map((session) => (
          <div
            key={session._id}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveSession(session)}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{session.title}</p>
                <p className="text-xs text-gray-400">{session.documentIds?.length || 0} docs • {session.chatHistory?.length || 0} messages</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteSession(session._id); }}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudySessionPage;
