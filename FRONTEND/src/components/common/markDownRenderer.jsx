import React from 'react';

/**
 * MarkdownRenderer - renders text content with basic formatting
 * Handles: headings, bold, italic, code blocks, inline code, lists, links, paragraphs
 */
const MarkdownRenderer = ({ content }) => {
  if (!content) {
    return <p className="text-gray-400 italic">No content available</p>;
  }

  // Process markdown-like text into HTML
  const processContent = (text) => {
    let html = text;

    // Code blocks (```)  
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm my-3 font-mono"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });

    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-800 mt-5 mb-2">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-800 mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-800 mt-6 mb-3">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold"><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-800">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em class="italic text-gray-600">$1</em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

    // Unordered lists
    html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-4 text-gray-600 list-disc">$1</li>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-gray-600 list-decimal">$1</li>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-500 underline hover:text-indigo-600">$1</a>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="my-4 border-gray-200" />');

    // Line breaks → paragraphs
    html = html.replace(/\n\n/g, '</p><p class="text-gray-600 leading-relaxed mb-3">');
    html = html.replace(/\n/g, '<br />');

    return `<p class="text-gray-600 leading-relaxed mb-3">${html}</p>`;
  };

  return (
    <div
      className="prose prose-gray max-w-none text-sm"
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};

export default MarkdownRenderer;
