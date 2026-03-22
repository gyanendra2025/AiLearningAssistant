import React from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, BookOpen, BrainCircuit, Clock, Eye, HardDrive } from 'lucide-react';

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file type badge color
  const getTypeBadge = (filename) => {
    const ext = (filename || '').split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return { label: 'PDF', bg: 'bg-red-50', text: 'text-red-500' };
      case 'doc':
      case 'docx':
        return { label: 'DOC', bg: 'bg-blue-50', text: 'text-blue-500' };
      case 'txt':
        return { label: 'TXT', bg: 'bg-gray-100', text: 'text-gray-500' };
      default:
        return { label: ext?.toUpperCase() || 'FILE', bg: 'bg-indigo-50', text: 'text-indigo-500' };
    }
  };

  const typeBadge = getTypeBadge(document.filename || document.fileName || document.title);
  const flashcardCount = document.flashcardCount ?? document.flashcards?.length ?? 0;
  const quizCount = document.quizCount ?? document.quizzes?.length ?? 0;

  return (
    <div
      onClick={handleNavigate}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md shadow-indigo-100/20 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative"
    >
      {/* Delete button (top-right, shows on hover) */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
        title="Delete document"
      >
        <Trash2 className="w-4 h-4" strokeWidth={1.8} />
      </button>

      {/* Top: Icon + Type badge */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-indigo-500" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-800 truncate pr-8">
            {document.title || document.filename || 'Untitled Document'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${typeBadge.bg} ${typeBadge.text}`}>
              {typeBadge.label}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {moment(document.updatedAt || document.createdAt).fromNow()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-4">
        {/* File size */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <HardDrive className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>{formatSize(document.fileSize || document.size)}</span>
        </div>

        <div className="w-px h-3 bg-gray-200" />

        {/* Flashcards */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
          <span>{flashcardCount} cards</span>
        </div>

        <div className="w-px h-3 bg-gray-200" />

        {/* Quizzes */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <BrainCircuit className="w-3.5 h-3.5 text-violet-400" strokeWidth={1.5} />
          <span>{quizCount} quiz</span>
        </div>
      </div>

      {/* View button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all duration-200 cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5" strokeWidth={2} />
        View Document
      </button>
    </div>
  );
};

export default DocumentCard;
