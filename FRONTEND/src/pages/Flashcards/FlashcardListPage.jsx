import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, Trash2, X } from 'lucide-react';
import { flashcardService } from '../../Service/flashcardService';
import FlashCardSetCard from '../../components/flashcards/flashCardSetCard';
import Button from '../../components/common/button';
import toast from 'react-hot-toast';

const FlashcardListPage = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);

  const fetchSets = async () => {
    try {
      const data = await flashcardService.getAllFlashcardSets();
      setSets(data.flashcardSets || data.sets || data || []);
    } catch (error) {
      console.log('No flashcard sets:', error.message);
      setSets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, []);

  const openDeleteModal = (set) => {
    setSelectedSet(set);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSet) return;
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(selectedSet._id);
      toast.success('Flashcard set deleted');
      setIsDeleteModalOpen(false);
      setSelectedSet(null);
      fetchSets();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Flashcards</h1>
        <p className="text-gray-400 text-sm mt-1">All your AI-generated flashcard sets</p>
      </div>

      {/* Grid or empty */}
      {sets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sets.map((set) => (
            <FlashCardSetCard key={set._id} set={set} onDelete={openDeleteModal} />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-amber-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No flashcard sets yet</h3>
          <p className="text-sm text-gray-400">Open a document and generate flashcards from the Flashcards tab</p>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <button onClick={() => { setIsDeleteModalOpen(false); setSelectedSet(null); }} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" strokeWidth={1.8} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 text-center mb-1">Delete Flashcard Set?</h2>
            <p className="text-sm text-gray-400 text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setIsDeleteModalOpen(false); setSelectedSet(null); }} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting} icon={Trash2} className="flex-1">Delete</Button>
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

export default FlashcardListPage;