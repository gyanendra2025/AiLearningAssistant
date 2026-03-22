import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, Star, BookOpen, Loader2, Filter, X } from 'lucide-react';
import { flashcardService } from '../../Service/flashcardService';
import { aiService } from '../../Service/aiService';
import FlashCard from './FlashCard';
import Button from '../common/button';
import toast from 'react-hot-toast';

const FlashcardManager = ({ documentId }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [setId, setSetId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'starred'

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch flashcards
  const fetchFlashcards = async () => {
    try {
      const data = await flashcardService.getFlashcardsByDocument(documentId);
      const cards = data.flashcards || data.cards || data || [];
      setFlashcards(cards);
      if (data._id) setSetId(data._id);
      if (data.setId) setSetId(data.setId);
    } catch (error) {
      console.log('No flashcards yet:', error.message);
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

  // Generate flashcards
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await aiService.generateFlashcards(documentId);
      toast.success('Flashcards generated successfully!');
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || 'Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  // Toggle star
  const handleToggleStar = async (cardId, index) => {
    try {
      await flashcardService.toggleStarFlashcard(cardId);
      setFlashcards((prev) =>
        prev.map((card, i) =>
          (card._id === cardId || i === index)
            ? { ...card, isStarred: !card.isStarred, starred: !card.starred }
            : card
        )
      );
    } catch (error) {
      toast.error('Failed to update star');
    }
  };

  // Delete all
  const handleDeleteAll = async () => {
    if (!setId && flashcards.length === 0) return;
    setDeleting(true);
    try {
      const idToDelete = setId || flashcards[0]?._id;
      if (idToDelete) {
        await flashcardService.deleteFlashcardSet(idToDelete);
      }
      toast.success('Flashcards deleted');
      setFlashcards([]);
      setSetId(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  // Filter cards
  const filteredCards = filter === 'starred'
    ? flashcards.filter((c) => c.isStarred || c.starred)
    : flashcards;

  const starredCount = flashcards.filter((c) => c.isStarred || c.starred).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // Empty state
  if (flashcards.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-amber-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No flashcards yet</h3>
        <p className="text-sm text-gray-400 mb-5">Generate AI-powered flashcards from this document</p>
        <Button onClick={handleGenerate} loading={generating} icon={Sparkles}>
          {generating ? 'Generating...' : 'Generate Flashcards'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-500" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                {flashcards.length} Flashcard{flashcards.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-xs text-gray-400">
                {starredCount} starred • Click a card to flip
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter toggle */}
            <button
              onClick={() => setFilter(filter === 'all' ? 'starred' : 'all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === 'starred'
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filter === 'starred' ? 'fill-amber-400 text-amber-400' : ''}`} strokeWidth={1.8} />
              {filter === 'starred' ? 'Starred' : 'All'}
            </button>

            {/* Regenerate */}
            <Button size="sm" onClick={handleGenerate} loading={generating} icon={Sparkles}>
              Regenerate
            </Button>

            {/* Delete all */}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete all flashcards"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card, i) => (
            <FlashCard
              key={card._id || i}
              question={card.question || card.front || 'Question'}
              answer={card.answer || card.back || 'Answer'}
              isStarred={card.isStarred || card.starred || false}
              onToggleStar={() => handleToggleStar(card._id, i)}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 rounded-2xl border border-white/60 shadow-md p-8 text-center">
          <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-sm text-gray-400">No starred flashcards yet</p>
          <button
            onClick={() => setFilter('all')}
            className="text-xs text-indigo-500 mt-2 cursor-pointer hover:underline"
          >
            Show all cards
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
            style={{ animation: 'fadeInUp 0.3s ease-out' }}
          >
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" strokeWidth={1.8} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 text-center mb-1">Delete All Flashcards?</h2>
            <p className="text-sm text-gray-400 text-center mb-2">
              This will permanently delete all {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}.
            </p>
            <p className="text-xs text-red-400 text-center mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAll}
                loading={deleting}
                icon={Trash2}
                className="flex-1"
              >
                Delete All
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
  );
};

export default FlashcardManager;
