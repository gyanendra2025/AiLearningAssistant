import React, { useState } from 'react';
import { Sparkles, FileText, Lightbulb, ArrowRight, List, BookOpen, BrainCircuit, Loader2 } from 'lucide-react';
import { aiService } from '../../Service/aiService';
import Modal from '../common/modal';
import MarkdownRenderer from '../common/markDownRenderer';
import Button from '../common/button';
import toast from 'react-hot-toast';

const AiActions = ({ documentId }) => {
  // Summary state
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Explain concept state
  const [concept, setConcept] = useState('');
  const [generatingExplanation, setGeneratingExplanation] = useState(false);
  const [explanationContent, setExplanationContent] = useState('');
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);

  // Generate Flashcards state
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

  // Generate Quiz state
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Generate Summary
  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const data = await aiService.generateSummary(documentId);
      setSummaryContent(data.data?.summary || data.summary || data.content || data.response || data.message || 'No summary generated');
      setIsSummaryModalOpen(true);
    } catch (error) {
      toast.error(error.message || 'Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Explain Concept
  const handleExplainConcept = async () => {
    if (!concept.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    setGeneratingExplanation(true);
    try {
      const data = await aiService.explainConcept(documentId, concept.trim());
      setExplanationContent(data.data?.explanation || data.explanation || data.content || data.response || data.message || 'No explanation generated');
      setIsExplanationModalOpen(true);
    } catch (error) {
      toast.error(error.message || 'Failed to explain concept');
    } finally {
      setGeneratingExplanation(false);
    }
  };

  // Generate Flashcards
  const handleGenerateFlashcards = async () => {
    setGeneratingFlashcards(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success('Flashcards generated! Switch to the Flashcards tab to view them.');
    } catch (error) {
      toast.error(error.message || 'Failed to generate flashcards');
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      await aiService.generateQuiz(documentId);
      toast.success('Quiz generated! Switch to the Quizzes tab to attempt it.');
    } catch (error) {
      toast.error(error.message || 'Failed to generate quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const actions = [
    {
      title: 'Generate Summary',
      description: 'AI will analyze and create a structured summary with key points and important details.',
      icon: FileText,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      loading: generatingSummary,
      onClick: handleGenerateSummary,
      buttonText: 'Generate Summary',
      loadingText: 'Generating...',
    },
    {
      title: 'Explain a Concept',
      description: 'Enter any topic from the document and get a detailed, easy-to-understand explanation.',
      icon: Lightbulb,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      loading: generatingExplanation,
      onClick: handleExplainConcept,
      buttonText: 'Explain',
      loadingText: 'Explaining...',
      hasInput: true,
    },
    {
      title: 'Generate Flashcards',
      description: 'Create AI-powered flashcards from this document for quick revision and memorization.',
      icon: BookOpen,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-500',
      loading: generatingFlashcards,
      onClick: handleGenerateFlashcards,
      buttonText: 'Generate Flashcards',
      loadingText: 'Generating...',
    },
    {
      title: 'Generate Quiz',
      description: 'Test your understanding with an AI-generated quiz based on the document content.',
      icon: BrainCircuit,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      loading: generatingQuiz,
      onClick: handleGenerateQuiz,
      buttonText: 'Generate Quiz',
      loadingText: 'Generating...',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200/50">
            <Sparkles className="w-5 h-5 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">AI Assistant</h2>
            <p className="text-xs text-gray-400">Powered by AI</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Use AI to generate summaries, explain concepts, create flashcards, and quiz yourself — all from this document.
        </p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.title}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${action.iconColor}`} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{action.title}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">{action.description}</p>

              {/* Concept input */}
              {action.hasInput && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') action.onClick(); }}
                    placeholder="Enter a topic you want to understand..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-300"
                  />
                </div>
              )}

              <Button
                onClick={action.onClick}
                loading={action.loading}
                disabled={action.hasInput && !concept.trim()}
                icon={action.loading ? undefined : Sparkles}
                fullWidth
              >
                {action.loading ? action.loadingText : action.buttonText}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Summary Modal */}
      <Modal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        title="Document Summary"
        subtitle="AI-generated summary of your document"
        size="lg"
      >
        <MarkdownRenderer content={summaryContent} />
      </Modal>

      {/* Explanation Modal */}
      <Modal
        isOpen={isExplanationModalOpen}
        onClose={() => setIsExplanationModalOpen(false)}
        title={`Concept: ${concept}`}
        subtitle="AI-generated explanation"
        size="lg"
      >
        <MarkdownRenderer content={explanationContent} />
      </Modal>
    </div>
  );
};

export default AiActions;
