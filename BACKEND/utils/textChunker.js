// Splits full text into chunks with overlap.
// Returns: [{ content, chunkIndex, pageNumber }]

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Normalize text
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\n+/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

  // Split into paragraphs
  const paragraphs = cleanedText
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/);
    const wordCount = words.length;

    // Case 1: paragraph itself is larger than chunkSize
    if (wordCount > chunkSize) {
      // Flush existing chunk
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      // Split large paragraph directly
      for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunkWords = words.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });

        if (i + chunkSize >= words.length) break;
      }
      continue;
    }

    // Case 2: adding paragraph exceeds chunkSize
    if (currentWordCount + wordCount > chunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        content: currentChunk.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      // Create overlap
      const prevWords = currentChunk.join(" ").split(/\s+/);
      const overlapWords = prevWords.slice(
        -Math.min(overlap, prevWords.length),
      );

      currentChunk = [...overlapWords, paragraph];
      currentWordCount = overlapWords.length + wordCount;
    } else {
      currentChunk.push(paragraph);
      currentWordCount += wordCount;
    }
  }

  // Push final chunk
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join(" "),
      chunkIndex: chunkIndex++,
      pageNumber: 0,
    });
  }

  return chunks;
};

// Finds most relevant chunks using keyword scoring
export const findRelevantChunk = (chunks, query, maxChunks = 3) => {
  if (
    !Array.isArray(chunks) ||
    chunks.length === 0 ||
    !query ||
    query.trim().length === 0
  ) {
    return [];
  }

  const stopWords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "with",
    "to",
    "for",
    "of",
    "as",
    "by",
    "this",
    "that",
    "it",
  ]);

  // Normalize query
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Fallback: return first chunks if query has no useful words
  if (queryWords.length === 0) {
    return chunks.slice(0, maxChunks).map((chunk) => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id || null,
      score: 0,
    }));
  }

  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;

    let rawScore = 0;
    const matchedWords = new Set();

    for (const word of queryWords) {
      // Exact word match
      const exactMatches = (
        content.match(new RegExp(`\\b${word}\\b`, "g")) || []
      ).length;
      rawScore += exactMatches * 3;

      // Partial match
      const partialMatches = (content.match(new RegExp(word, "g")) || [])
        .length;
      rawScore += Math.max(0, partialMatches - exactMatches) * 1.5;

      if (exactMatches > 0 || partialMatches > 0) {
        matchedWords.add(word);
      }
    }

    // Normalize score by chunk length
    const normalizedScore = rawScore / Math.sqrt(contentWords || 1);

    // Small position bonus for earlier chunks
    const positionBonus = 1 - (index / chunks.length) * 0.1;

    const finalScore = normalizedScore * positionBonus;

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id || null,
      score: finalScore,
      rawScore,
      matchWords: matchedWords.size,
    };
  });

  // Sort by relevance
  return scoredChunks
    .filter((c) => c.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.matchWords !== a.matchWords) return b.matchWords - a.matchWords;
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);
};

