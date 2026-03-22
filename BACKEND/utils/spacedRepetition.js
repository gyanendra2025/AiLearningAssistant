/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Quality ratings:
 *   1 = Complete blackout (again)
 *   2 = Incorrect, but recognised answer (hard)
 *   3 = Correct with serious difficulty (okay)
 *   4 = Correct with some hesitation (good)
 *   5 = Perfect recall (easy)
 *
 * @param {number} quality - User self-rating 1-5
 * @param {number} easeFactor - Current ease factor (default 2.5)
 * @param {number} interval - Current interval in days
 * @param {number} consecutiveCorrect - Number of consecutive correct answers
 * @returns {{ newEaseFactor, newInterval, nextReviewDate, consecutiveCorrect }}
 */
export const calculateNextReview = (quality, easeFactor = 2.5, interval = 0, consecutiveCorrect = 0) => {
  // Clamp quality to 1-5
  const q = Math.max(1, Math.min(5, quality));

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  let newEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  newEF = Math.max(1.3, newEF); // EF never goes below 1.3

  let newInterval;
  let newConsecutive;

  if (q < 3) {
    // Failed — reset to beginning
    newInterval = 0;
    newConsecutive = 0;
  } else {
    // Passed
    newConsecutive = consecutiveCorrect + 1;

    if (newConsecutive === 1) {
      newInterval = 1;
    } else if (newConsecutive === 2) {
      newInterval = 3;
    } else {
      newInterval = Math.round(interval * newEF);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    newEaseFactor: Math.round(newEF * 100) / 100,
    newInterval,
    nextReviewDate,
    consecutiveCorrect: newConsecutive,
  };
};

/**
 * Sort cards by review urgency. Cards due first, then by oldest review.
 */
export const sortByReviewPriority = (cards) => {
  const now = new Date();
  return [...cards].sort((a, b) => {
    const aDue = new Date(a.nextReviewDate || 0);
    const bDue = new Date(b.nextReviewDate || 0);

    // Cards that are due come before cards that are not
    const aIsDue = aDue <= now;
    const bIsDue = bDue <= now;

    if (aIsDue && !bIsDue) return -1;
    if (!aIsDue && bIsDue) return 1;

    // If both due (or both not due), sort by date
    return aDue - bDue;
  });
};
