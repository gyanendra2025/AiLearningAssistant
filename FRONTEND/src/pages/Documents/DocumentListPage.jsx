import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, X, FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentService } from '../../Service/documentService';
import Spinner from '../../components/common/spinner';
import Button from '../../components/common/button';
import DocumentCard from '../../components/documents/DocumentCard';

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data.data || data.documents || data || []);
    } catch (error) {
      console.log('Fetch error:', error.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // File handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Upload
  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }
    if (!uploadTitle.trim()) {
      toast.error('Please enter a document title');
      return;
    }
    setUploading(true);
    try {
      await documentService.uploadDocument(uploadFile, uploadTitle.trim());
      toast.success('Document uploaded successfully!');
      closeUploadModal();
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadTitle('');
    setDragActive(false);
  };

  // Delete
  const openDeleteModal = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success('Document deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // Format file size for upload modal
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filter documents
  const filteredDocs = documents.filter((doc) =>
    (doc.title || doc.filename || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Render Content ──
  const renderContent = () => {
    if (loading) {
      return <Spinner fullScreen />;
    }

    if (filteredDocs.length === 0 && searchQuery) {
      return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-12 text-center">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No results found</h3>
          <p className="text-sm text-gray-400">No documents matching "{searchQuery}"</p>
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-indigo-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No documents yet</h3>
          <p className="text-sm text-gray-400 mb-5">Upload your first document to start learning with AI</p>
          <Button icon={Plus} onClick={() => setIsUploadModalOpen(true)}>
            Upload Document
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={openDeleteModal}
          />
        ))}

        {/* Upload new card */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 p-5 flex flex-col items-center justify-center gap-2 min-h-[200px] text-gray-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50/50 flex items-center justify-center">
            <Plus className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium">Upload new document</span>
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
            My Documents
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Upload and manage your study materials
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsUploadModalOpen(true)}>
          Upload Document
        </Button>
      </div>

      {/* Search Bar */}
      {documents.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white/70 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-300"
          />
        </div>
      )}

      {/* Content */}
      {renderContent()}

      {/* ── Upload Modal ── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            style={{ animation: 'fadeInUp 0.3s ease-out' }}
          >
            {/* Close */}
            <button
              onClick={closeUploadModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-800 mb-1">Upload New Document</h2>
            <p className="text-sm text-gray-400 mb-5">Add a document to study with AI assistance</p>

            {/* Document Title */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-300"
                placeholder="e.g. Machine Learning Notes"
              />
            </div>

            {/* File drop zone */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Select File
              </label>
              <label
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? 'border-indigo-400 bg-indigo-50/40'
                    : uploadFile
                    ? 'border-indigo-300 bg-indigo-50/20'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/10'
                }`}
              >
                {uploadFile ? (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-5 h-5 text-indigo-500" strokeWidth={1.8} />
                    </div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[250px]">
                      {uploadFile.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatFileSize(uploadFile.size)} • Click to change
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-gray-500">
                      Drag & drop or click to select
                    </span>
                    <span className="text-xs text-gray-300 mt-1">
                      PDF, DOC, DOCX, TXT, PPT, PPTX, CSV, MD
                    </span>
                  </>
                )}
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.csv,.md"
                  className="hidden"
                />
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={closeUploadModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                loading={uploading}
                disabled={!uploadFile || !uploadTitle.trim()}
                icon={Upload}
                className="flex-1"
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
            style={{ animation: 'fadeInUp 0.3s ease-out' }}
          >
            <button
              onClick={() => { setIsDeleteModalOpen(false); setSelectedDoc(null); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" strokeWidth={1.8} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 text-center mb-1">Delete Document?</h2>
            <p className="text-sm text-gray-400 text-center mb-2">
              Are you sure you want to delete
            </p>
            <p className="text-sm font-semibold text-gray-700 text-center mb-1 truncate px-4">
              "{selectedDoc?.title || selectedDoc?.filename || 'Untitled'}"
            </p>
            <p className="text-xs text-red-400 text-center mb-5">
              This action cannot be undone. All flashcards and quizzes for this document will also be deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => { setIsDeleteModalOpen(false); setSelectedDoc(null); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                loading={deleting}
                icon={Trash2}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframe */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DocumentListPage;