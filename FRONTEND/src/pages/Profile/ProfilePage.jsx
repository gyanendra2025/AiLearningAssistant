import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Save, Shield, Calendar, BrainCircuit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../Service/authService';
import Button from '../../components/common/button';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  // Profile state
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  // Password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Load profile from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await authService.getProfile();
        const profile = data.user || data;
        setUsername(profile.username || '');
        setEmail(profile.email || '');
      } catch (error) {
        // Fallback to context
      }
    };
    loadProfile();
  }, []);

  // Save profile
  const handleSaveProfile = async () => {
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }
    setSaving(true);
    try {
      const data = await authService.updateProfile({ username });
      updateUser({ username });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-300";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account settings</p>
      </div>

      {/* Avatar + Info Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <span className="text-2xl font-bold text-white">
              {(username || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{username || 'User'}</h2>
            <p className="text-sm text-gray-400">{email}</p>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.8} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`${inputClass} pl-11`}
                placeholder="Your username"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.8} />
              <input
                type="email"
                value={email}
                readOnly
                className={`${inputClass} pl-11 bg-gray-50 cursor-not-allowed text-gray-400`}
              />
            </div>
            <p className="text-[10px] text-gray-300 mt-1">Email cannot be changed</p>
          </div>

          <Button onClick={handleSaveProfile} loading={saving} icon={Save}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-500" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Password & Security</h3>
              <p className="text-xs text-gray-400">Update your password</p>
            </div>
          </div>
          {!showPasswordSection && (
            <Button
              variant="secondary"
              size="sm"
              icon={Lock}
              onClick={() => setShowPasswordSection(true)}
            >
              Change Password
            </Button>
          )}
        </div>

        {showPasswordSection && (
          <div className="space-y-4 pt-2 border-t border-gray-100 mt-4" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.8} />
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`${inputClass} pl-11 pr-11`}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.8} />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${inputClass} pl-11 pr-11`}
                  placeholder="Enter new password (min 6 chars)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.8} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pl-11`}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPasswordSection(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                loading={changingPassword}
                icon={Shield}
              >
                Update Password
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-indigo-500" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">About MindSpark</h3>
            <p className="text-xs text-gray-400">AI-powered learning assistant</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          MindSpark uses AI to help you learn faster. Upload documents, generate flashcards, take quizzes, and chat with AI — all designed to make studying more effective and enjoyable.
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
