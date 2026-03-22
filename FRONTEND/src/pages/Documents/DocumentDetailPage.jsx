import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FileText, MessageSquare, Sparkles, BookOpen, BrainCircuit, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { documentService } from '../../Service/documentService';
import Spinner from '../../components/common/spinner';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import MarkdownRenderer from '../../components/common/markDownRenderer';
import ChatInterface from '../../components/chat/chatInterface';
import AiActions from '../../components/ai/AiActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import QuizManager from '../../components/quizzes/QuizManager';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'ai-actions', label: 'AI Actions', icon: Sparkles },
  { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
  { id: 'quizzes', label: 'Quizzes', icon: BrainCircuit },
];

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'content');
  const [fontSize, setFontSize] = useState(14);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data.data || data.document || data);
      } catch (error) {
        toast.error(error.message || 'Failed to load document');
        console.log('Document fetch error:', error.message);
        // Fallback for dev
        setDocument({
          _id: id,
          title: 'Sample Document',
          content: 'Document content could not be loaded.',
          filename: 'sample.pdf',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  // Keep ?tab= in sync with the active tab for deep-linking and back/forward navigation
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (activeTab !== currentTab) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', activeTab);
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  if (loading) {
    return <Spinner fullScreen />;
  }

  // ── Content Tab ──
  const renderContentTab = () => {
    const content = document?.extractedText || document?.content || document?.text || '';
    const fileUrl = document?.fileUrl || document?.filePath || document?.url;

    // If it's a PDF and we have a URL, render iframe
    const isPdf = (document?.filename || document?.fileName || '').toLowerCase().endsWith('.pdf');

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white/90">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileText className="w-4 h-4 text-indigo-500" strokeWidth={1.8} />
            <span className="font-medium">{document?.filename || document?.fileName || 'Document'}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <button
              onClick={() => setFontSize((prev) => Math.max(10, prev - 2))}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" strokeWidth={1.8} />
            </button>
            <span className="text-xs text-gray-400 w-10 text-center">{fontSize}px</span>
            <button
              onClick={() => setFontSize((prev) => Math.min(24, prev + 2))}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" strokeWidth={1.8} />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" strokeWidth={1.8} />
              </a>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div
          className="p-6 sm:p-8 max-h-[calc(100vh-320px)] overflow-y-auto"
          style={{ fontSize: `${fontSize}px` }}
        >
          {isPdf && fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-[70vh] border-0 rounded-lg"
              title="PDF Viewer"
            />
          ) : content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-gray-400 text-sm">No content extracted from this document</p>
              <p className="text-gray-300 text-xs mt-1">Content extraction may still be processing</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Chat Tab ──
  const renderChatTab = () => {
    return <ChatInterface documentId={id} />;
  };

  // ── AI Actions Tab ──
  const renderAiActionsTab = () => {
    return <AiActions documentId={id} />;
  };

  // ── Flashcards Tab ──
  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={id} />;
  };

  // ── Quizzes Tab ──
  const renderQuizzesTab = () => {
    return <QuizManager documentId={id} />;
  };

  // Tab content router
  const renderTabContent = () => {
    switch (activeTab) {
      case 'content':
        return renderContentTab();
      case 'chat':
        return renderChatTab();
      case 'ai-actions':
        return renderAiActionsTab();
      case 'flashcards':
        return renderFlashcardsTab();
      case 'quizzes':
        return renderQuizzesTab();
      default:
        return renderContentTab();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Page Header */}
      <PageHeader
        title={document?.title || document?.filename || 'Document'}
        subtitle={document?.filename}
        backPath="/documents"
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default DocumentDetailPage;