import React, { useState, useEffect } from 'react';
import { Users, Plus, Copy, Trash2, LogOut, Share2, FileText, BookOpen, ClipboardCheck, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      const { data } = await axiosInstance.get('/api/groups');
      setGroups(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return toast.error('Group name required');
    try {
      const { data } = await axiosInstance.post('/api/groups', { name: groupName, description });
      setGroups((prev) => [data.data, ...prev]);
      setShowCreate(false);
      setGroupName('');
      setDescription('');
      toast.success('Group created!');
    } catch (err) { toast.error('Failed to create group'); }
  };

  const joinGroup = async () => {
    if (!inviteCode.trim()) return toast.error('Enter invite code');
    try {
      const { data } = await axiosInstance.post(`/api/groups/join/${inviteCode}`);
      setGroups((prev) => [data.data, ...prev]);
      setShowJoin(false);
      setInviteCode('');
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.error || 'Invalid invite code'); }
  };

  const leaveGroup = async (id) => {
    try {
      await axiosInstance.delete(`/api/groups/${id}/leave`);
      setGroups((prev) => prev.filter((g) => g._id !== id));
      if (activeGroup?._id === id) setActiveGroup(null);
      toast.success('Left group');
    } catch (err) { toast.error('Failed to leave group'); }
  };

  const copyInvite = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied!');
  };

  const viewGroup = async (id) => {
    try {
      const { data } = await axiosInstance.get(`/api/groups/${id}`);
      setActiveGroup(data.data);
    } catch (err) { toast.error('Failed to load group'); }
  };

  // Group detail view
  if (activeGroup) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveGroup(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activeGroup.name}</h1>
            {activeGroup.description && <p className="text-sm text-gray-500 dark:text-gray-400">{activeGroup.description}</p>}
          </div>
          <button onClick={() => copyInvite(activeGroup.inviteCode)} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
            <Copy className="w-4 h-4" /> {activeGroup.inviteCode}
          </button>
        </div>

        {/* Members */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Members ({activeGroup.members?.length || 0})</h2>
          <div className="space-y-2">
            {activeGroup.members?.map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                  {(m.userId?.username || '?')[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{m.userId?.username || m.userId?.email || 'Member'}</span>
                <span className="text-xs text-gray-400 ml-auto">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Content */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Shared Content</h2>

          {activeGroup.sharedDocuments?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">📄 Documents</p>
              {activeGroup.sharedDocuments.map((doc) => (
                <div key={doc._id} className="flex items-center gap-2 py-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{doc.title}</span>
                </div>
              ))}
            </div>
          )}

          {(!activeGroup.sharedDocuments?.length && !activeGroup.sharedFlashcards?.length && !activeGroup.sharedQuizzes?.length) && (
            <p className="text-gray-400 text-sm">No content shared yet. Share documents, flashcards, or quizzes from their pages.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Collaborate and share with others</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}
            className="flex items-center gap-2 px-4 py-2.5 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
            <Share2 className="w-4 h-4" /> Join
          </button>
          <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
      </div>

      {/* Join Form */}
      {showJoin && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-5 border border-gray-100 dark:border-gray-700 flex gap-3">
          <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Paste invite code" className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          <button onClick={joinGroup} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">Join</button>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-3">
          <input value={groupName} onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          <input value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          <button onClick={createGroup} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">Create Group</button>
        </div>
      )}

      {/* Group List */}
      <div className="space-y-3">
        {groups.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No groups yet</p>
            <p className="text-sm">Create or join a study group to collaborate</p>
          </div>
        )}
        {groups.map((group) => (
          <div key={group._id}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => viewGroup(group._id)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold">
                {group.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{group.name}</p>
                <p className="text-xs text-gray-400">{group.members?.length || 0} members</p>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); leaveGroup(group._id); }}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupsPage;
