import React, { useState, useEffect } from 'react';
import { X, Users2, Building2, Sparkles, UserCheck, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CreateTeamModal: React.FC = () => {
  const { 
    isTeamModalOpen, 
    setIsTeamModalOpen, 
    editingTeam, 
    setEditingTeam, 
    addTeam, 
    updateTeam, 
    departments, 
    users 
  } = useApp();

  const [name, setName] = useState('');
  const [shortTag, setShortTag] = useState('');
  const [code, setCode] = useState('');
  const [department, setDepartment] = useState('');
  const [leadId, setLeadId] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [status, setStatus] = useState<'Active' | 'Hiring' | 'Restructuring'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTeam) {
      setName(editingTeam.name || '');
      setShortTag(editingTeam.shortTag || '');
      setCode(editingTeam.code || '');
      setDepartment(editingTeam.department || departments[0]?.name || '');
      const foundLead = users.find(u => u.id === editingTeam.teamLeadId || u.name === editingTeam.leadName);
      setLeadId(foundLead ? foundLead.id : (editingTeam.teamLeadId || ''));
      setFocusArea(editingTeam.focusArea || '');
      setStatus(editingTeam.status || 'Active');
    } else {
      setName('');
      setShortTag('');
      setCode('');
      setDepartment(departments[0]?.name || '');
      setLeadId(users[0]?.id || '');
      setFocusArea('');
      setStatus('Active');
    }
  }, [editingTeam, isTeamModalOpen, departments, users]);

  if (!isTeamModalOpen) return null;

  const handleClose = () => {
    setIsTeamModalOpen(false);
    setEditingTeam(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedDept = departments.find(d => d.name === department);
      const selectedLead = users.find(u => u.id === leadId);

      const generatedCode = code.trim() || `${department.substring(0, 3).toUpperCase()}-${name.substring(0, 2).toUpperCase()}`;
      const generatedTag = shortTag.trim() || name.substring(0, 2).toUpperCase();

      if (editingTeam) {
        await updateTeam(
          editingTeam.id, 
          {
            name,
            code: generatedCode,
            shortTag: generatedTag,
            department,
            leadName: selectedLead ? selectedLead.name : editingTeam.leadName,
            leadAvatar: selectedLead ? selectedLead.avatar : editingTeam.leadAvatar,
            focusArea,
            status
          },
          selectedDept?.id,
          leadId
        );
      } else {
        await addTeam(
          {
            name,
            code: generatedCode,
            shortTag: generatedTag,
            department,
            leadName: selectedLead ? selectedLead.name : 'Unassigned',
            leadAvatar: selectedLead ? selectedLead.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            focusArea,
            status
          },
          selectedDept?.id,
          leadId
        );
      }

      handleClose();
    } catch (err) {
      console.error('Error saving team:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingTeam ? 'Edit Team Details' : 'Create New Team'}
              </h3>
              <p className="text-xs text-slate-400">
                {editingTeam ? 'Modify squad allocation and leadership' : 'Provision operational team unit into organization'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Team Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Frontend Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Short Tag
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. FE"
                value={shortTag}
                onChange={(e) => setShortTag(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Team Code
              </label>
              <input
                type="text"
                placeholder="ENG-FE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Department *</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Team Lead / Manager</span>
              </label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Focus Area & Operational Scope
            </label>
            <textarea
              rows={2}
              placeholder="React, WebGL, Design Systems, High-throughput API..."
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="Active">Active Squad</option>
              <option value="Hiring">Hiring / Expanding</option>
              <option value="Restructuring">Restructuring</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
