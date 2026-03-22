import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, MessageSquarePlus, Trash2 } from 'lucide-react';
import { aiService } from '../../Service/aiService';
import MarkdownRenderer from '../common/markDownRenderer';
import toast from 'react-hot-toast';

const ChatInterface = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await aiService.getChatHistory(documentId);
        const history = data.data || data.chatHistory || data.messages || data || [];
        // Convert history to messages format
        const formatted = [];
        history.forEach((msg) => {
          if (msg.role === 'user' || msg.sender === 'user') {
            formatted.push({ role: 'user', content: msg.content || msg.message });
          }
          if (msg.role === 'assistant' || msg.sender === 'assistant' || msg.response) {
            formatted.push({ role: 'assistant', content: msg.content || msg.response || msg.message });
          }
        });
        setMessages(formatted);
      } catch (error) {
        console.log('No chat history:', error.message);
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    if (documentId) loadHistory();
  }, [documentId]);

  // Send message
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const data = await aiService.chat(documentId, trimmed);
      const assistantMsg = {
        role: 'assistant',
        content: data.data?.answer || data.response || data.message || data.content || 'No response',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      toast.error(error.message || 'Failed to get response');
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Failed to get response. Please try again.' }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // New chat
  const handleNewChat = () => {
    setMessages([]);
  };

  if (loadingHistory) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white/80">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-500" strokeWidth={1.8} />
          <span className="text-sm font-semibold text-gray-700">AI Chat</span>
          <span className="text-xs text-gray-400">({messages.length} messages)</span>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" strokeWidth={2} />
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
              <Bot className="w-7 h-7 text-indigo-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Start a conversation</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Ask anything about this document — summaries, explanations, or specific questions
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              )}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-indigo-500" strokeWidth={2} />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white/80">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this document..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-300 resize-none overflow-hidden"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = '44px';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200/50 hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
