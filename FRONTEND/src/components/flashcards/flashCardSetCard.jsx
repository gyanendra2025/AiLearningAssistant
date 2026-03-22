import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Trash2, Star, Clock, FileText, ArrowRight } from 'lucide-react';
import moment from 'moment';

const FlashCardSetCard = ({ set, onDelete }) => {
  const navigate = useNavigate();

  const cards = set.cards || set.flashcards || [];
  const cardCount = cards.length || set.cardCount || 0;
  const starredCount = cards.filter((c) => c.isStarred || c.starred).length;
  const reviewedCount = cards.filter((c) => c.reviewed || c.isReviewed).length;
  const docTitle = set.document?.title || set.documentTitle || 'Document';
  const documentId = set.document?._id || set.documentId || set.document;

  // Progress percentage
  const progress = cardCount > 0 ? Math.round((reviewedCount / cardCount) * 100) : 0;

  const handleStudyNow = (e) => {
    e.stopPropagation();
    // Redirect to document detail page → flashcards tab
    if (documentId) {
      navigate(`/documents/${documentId}?tab=flashcards`);
    } else {
      navigate(`/flashcards/${set._id}`);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative">
      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete?.(set); }}
        className="absolute top-3 right-3 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" strokeWidth={1.8} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-amber-500" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-800 truncate pr-8">
            {set.title || 'Flashcard Set'}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
            <FileText className="w-3 h-3 flex-shrink-0" />
            {docTitle}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Progress</span>
          <span className="text-[10px] font-bold text-indigo-500">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
          {cardCount} cards
        </span>
        {starredCount > 0 && (
          <>
            <div className="w-px h-3 bg-gray-200" />
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" strokeWidth={1.5} />
              {starredCount}
            </span>
          </>
        )}
        <div className="w-px h-3 bg-gray-200" />
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {moment(set.updatedAt || set.createdAt).fromNow()}
        </span>
      </div>

      {/* Study Now button */}
      <button
        onClick={handleStudyNow}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-200/50 transition-all cursor-pointer active:scale-[0.97]"
      >
        <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
        Study Now
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  );
};

export default FlashCardSetCard;
