import React, { useState } from 'react';
import { Star, RotateCcw } from 'lucide-react';

/**
 * FlashCard — flip card with question on front, answer on back
 *
 * Props:
 *  - question  : string
 *  - answer    : string
 *  - isStarred : boolean
 *  - onToggleStar : () => void
 *  - index     : number (for display)
 */
const FlashCard = ({ question, answer, isStarred, onToggleStar, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group perspective-1000"
      style={{ perspective: '1000px' }}
    >
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full min-h-[220px] cursor-pointer transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front — Question */}
        <div
          className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-5 flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
              Q{index + 1}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStar?.(); }}
              className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-amber-50"
            >
              <Star
                className={`w-4 h-4 transition-colors ${isStarred ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                strokeWidth={1.8}
              />
            </button>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm font-medium text-gray-800 text-center leading-relaxed">
              {question}
            </p>
          </div>

          {/* Hint */}
          <p className="text-[10px] text-gray-300 text-center mt-3 flex items-center justify-center gap-1">
            <RotateCcw className="w-3 h-3" /> Click to reveal answer
          </p>
        </div>

        {/* Back — Answer */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100/60 shadow-md p-5 flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <span className="text-[10px] font-bold text-violet-500 bg-violet-100 px-2 py-0.5 rounded-md">
              Answer
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStar?.(); }}
              className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-amber-50"
            >
              <Star
                className={`w-4 h-4 transition-colors ${isStarred ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                strokeWidth={1.8}
              />
            </button>
          </div>

          {/* Answer */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              {answer}
            </p>
          </div>

          {/* Hint */}
          <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
            <RotateCcw className="w-3 h-3" /> Click to flip back
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
