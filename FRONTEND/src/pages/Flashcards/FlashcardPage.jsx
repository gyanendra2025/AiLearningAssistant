import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Star, BookOpen } from 'lucide-react';
import { flashcardService } from '../../Service/flashcardService';
import FlashCard from '../../components/flashcards/FlashCard';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';

const FlashcardPage = () => {
  const { id } = useParams();
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await flashcardService.getFlashcardsByDocument(id);
        setFlashcardSet(data);
        setCards(data.flashcards || data.cards || data || []);
      } catch (error) {
        console.log('Fetch error:', error.message);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [id]);

  const handleToggleStar = async (cardId, index) => {
    try {
      await flashcardService.toggleStarFlashcard(cardId);
      setCards((prev) =>
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

  const filteredCards = filter === 'starred'
    ? cards.filter((c) => c.isStarred || c.starred)
    : cards;

  const starredCount = cards.filter((c) => c.isStarred || c.starred).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <PageHeader
        title={flashcardSet?.title || 'Flashcard Set'}
        subtitle={`${cards.length} cards • ${starredCount} starred`}
        backPath="/flashcards"
      />

      {/* Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filter === 'all' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          All ({cards.length})
        </button>
        <button
          onClick={() => setFilter('starred')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filter === 'starred' ? 'bg-amber-50 text-amber-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Star className={`w-3.5 h-3.5 ${filter === 'starred' ? 'fill-amber-400 text-amber-400' : ''}`} strokeWidth={1.8} />
          Starred ({starredCount})
        </button>
      </div>

      {/* Cards */}
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
        <div className="bg-white/80 rounded-2xl border border-white/60 shadow-md p-12 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-gray-400">
            {filter === 'starred' ? 'No starred flashcards' : 'No flashcards in this set'}
          </p>
          {filter === 'starred' && (
            <button onClick={() => setFilter('all')} className="text-xs text-indigo-500 mt-2 cursor-pointer hover:underline">
              Show all cards
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardPage;