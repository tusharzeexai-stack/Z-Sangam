import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Pencil, 
  Trash2, 
  Shield, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Team, User, UserRole } from '../../types';

interface TeamMembersModalProps {
  team: Team | null;
  onClose: () => void;
}

export const TeamMembersModal: React.FC<TeamMembersModalProps> = ({ team, onClose }) => {
  const { users, addMember, updateMember, deleteMember, departments } = useApp();

  // State for member edit / create inside modal
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);

  // Member form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Senior Engineer');
  const [status, setStatus] = useState<'Active' | 'Away' | 'Offline'>('Active');
  const [skills, setSkills] = useState('TypeScript, React, Cloud');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!team) return null;

  // Filter members belonging to this specific team
  const teamMembers = users.filter(u => 
    u.team?.toLowerCase() === team.name.toLowerCase() ||
    u.team?.toLowerCase() === team.code.toLowerCase() ||
    (u.department?.toLowerCase() === team.department.toLowerCase() && users.length === 1)
  );

  const handleOpenAddForm = () => {
    setEditingMember(null);
    setName('');
    setEmail('');
    setRole('Senior Engineer');
    setStatus('Active');
    setSkills('TypeScript, React, Cloud Architecture');
    setIsMemberFormOpen(true);
  };

  const handleOpenEditForm = (member: User) => {
    setEditingMember(member);
    setName(member.name || '');
    setEmail(member.email || '');
    setRole(member.role || 'Senior Engineer');
    setStatus(member.status || 'Active');
    setSkills(member.skills ? member.skills.join(', ') : '');
    setIsMemberFormOpen(true);
  };

  const handleDeleteMember = async (member: User) => {
    if (window.confirm(`Are you sure you want to delete member "${member.name}" from Supabase?`)) {
      try {
        await deleteMember(member.id);
      } catch (err) {
        console.error('Failed to delete member:', err);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const skillsList = skills.split(',').map(s => s.trim()).filter(Boolean);

      if (editingMember) {
        await updateMember(editingMember.id, {
          name,
          email,
          role,
          department: team.department,
          team: team.name,
          status,
          skills: skillsList
        });
      } else {
        await addMember({
          name,
          email,
          role,
          department: team.department,
          team: team.name,
          status,
          skills: skillsList
        });
      }
      setIsMemberFormOpen(false);
      setEditingMember(null);
    } catch (err) {
      console.error('Error saving member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm font-mono">
              {team.shortTag}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">{team.name}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {team.code}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {team.department}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Managing {teamMembers.length} team member{teamMembers.length === 1 ? '' : 's'} assigned to squad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Member Add / Edit Sub-Form */}
          {isMemberFormOpen && (
            <div className="bg-slate-950/90 border border-blue-500/30 rounded-xl p-4 mb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editingMember ? `Edit Member: ${editingMember.name}` : `Add New Member to ${team.name}`}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsMemberFormOpen(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@zsangam.enterprise"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Senior Engineer">Senior Engineer</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="AI Researcher">AI Researcher</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Designer">Designer</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Availability Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Away">Away</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="TypeScript, Python, Computer Vision"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMemberFormOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md"
                  >
                    {isSubmitting ? 'Saving...' : editingMember ? 'Save Changes' : 'Create & Assign Member'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members List Table / Cards */}
          {teamMembers.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-950/40">
              <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">No members assigned to {team.name}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                This squad has zero active members. Add members to start assigning tasks and tracking productivity.
              </p>
              <button
                onClick={handleOpenAddForm}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add First Member</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950/30 overflow-hidden">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img 
                        src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700"
                      />
                      <span 
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                          member.status === 'Active' ? 'bg-emerald-400' :
                          member.status === 'Away' ? 'bg-amber-400' : 'bg-slate-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{member.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                          {member.role}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {member.email}
                        </span>
                      </div>

                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {member.skills.map((skill, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for member */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenEditForm(member)}
                      title="Edit Member"
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs px-2.5 border border-slate-800"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteMember(member)}
                      title="Delete Member"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs px-2.5 border border-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            Squad <strong className="text-slate-200">{team.name}</strong> • Department: <strong className="text-slate-200">{team.department}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
