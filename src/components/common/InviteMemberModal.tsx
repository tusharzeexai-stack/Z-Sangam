import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield, Building2, Users2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InviteMemberModal: React.FC = () => {
  const { isInviteMemberOpen, setIsInviteMemberOpen, addMember, departments, teams } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Senior Engineer');
  const [department, setDepartment] = useState(departments[0]?.name || 'Engineering');
  const [team, setTeam] = useState(teams[0]?.name || 'Frontend Engineering');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Cloud Arch');

  if (!isInviteMemberOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const skills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    addMember({
      name,
      email,
      role: role as any,
      department,
      team,
      skills,
    });

    setName('');
    setEmail('');
    setIsInviteMemberOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Invite Organization Member</h3>
              <p className="text-xs text-slate-400">Send an enterprise invitation and provision RBAC access</p>
            </div>
          </div>
          <button
            onClick={() => setIsInviteMemberOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Dr. Samantha Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Corporate Email *</label>
              <input
                type="email"
                required
                placeholder="samantha.cruz@zsangam.enterprise"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Team</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Assigned Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="Senior Engineer">Senior Engineer</option>
              <option value="AI Researcher">AI Researcher</option>
              <option value="Team Lead">Team Lead</option>
              <option value="Department Head">Department Head</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Designer">Designer</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Member">Member</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Expertise & Skill Tags (Comma separated)</label>
            <input
              type="text"
              placeholder="PyTorch, CUDA, Vector Databases, Python"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsInviteMemberOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
