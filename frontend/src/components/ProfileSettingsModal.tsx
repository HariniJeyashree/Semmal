"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { X, Save, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProfileSettingsModalProps {
  onClose: () => void;
}

export default function ProfileSettingsModal({ onClose }: ProfileSettingsModalProps) {
  const { user, logout } = useAuth();
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword
      });
      setSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await api.delete("/auth/account");
      logout(); // This will redirect to login page
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#3A0A11] border border-[#D9A646]/20 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#D9A646]/20 bg-[#5C141F]/50">
          <h2 className="text-xl font-semibold text-[#F5EFE6]">Account Settings</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#3A0A11] text-[#F5EFE6]/70 hover:text-[#F5EFE6] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Profile Section */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-[#F5EFE6]/70 mb-4 uppercase tracking-wider">Profile</h3>
            <div className="bg-[#5C141F]/50 rounded-lg p-4 border border-[#D9A646]/20">
              <div className="text-sm text-[#F5EFE6]/70 mb-1">Email Address</div>
              <div className="text-[#F5EFE6] font-medium">{user?.email}</div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-[#F5EFE6]/70 mb-4 uppercase tracking-wider">Change Password</h3>
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#F5EFE6]/70 mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-[#120807] border border-[#D9A646]/20 rounded-lg px-4 py-2 text-[#F5EFE6] focus:outline-none focus:border-[#D9A646] focus:ring-1 focus:ring-[#D9A646] transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#F5EFE6]/70 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#120807] border border-[#D9A646]/20 rounded-lg px-4 py-2 text-[#F5EFE6] focus:outline-none focus:border-[#D9A646] focus:ring-1 focus:ring-[#D9A646] transition-colors"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#F5EFE6]/70 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#120807] border border-[#D9A646]/20 rounded-lg px-4 py-2 text-[#F5EFE6] focus:outline-none focus:border-[#D9A646] focus:ring-1 focus:ring-[#D9A646] transition-colors"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D9A646] to-[#F6D88A] hover:bg-[#D9A646] disabled:opacity-50 disabled:cursor-not-allowed text-[#3A0A11] px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div>
            <h3 className="text-sm font-medium text-red-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h3>
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-[#F5EFE6]/90 mb-4">
                Permanently delete your account and all associated data, including job sessions, candidate rankings, and interview history. This action cannot be undone.
              </p>
              
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[#F5EFE6]">Are you absolutely sure?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-[#F5EFE6] px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {loading ? "Deleting..." : "Yes, delete my account"}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      disabled={loading}
                      className="flex-1 bg-[#5C141F] hover:bg-[#3A0A11] text-[#F5EFE6] px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
