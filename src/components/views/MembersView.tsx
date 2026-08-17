import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  UserPlus, 
  RefreshCw, 
  X, 
  Building2, 
  Users2, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Mail,
  Shield,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

export const MembersView: React.FC = () => {
  const { 
    users, 
    departments, 
    teams, 
    setIsInviteMemberOpen, 
    showToast 
  } = useApp();

  const [deptFilter, setDeptFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const filteredUsers = users.filter(u => {
    if (deptFilter !== 'All' && u.department !== deptFilter) return false;
    if (teamFilter !== 'All' && u.team !== teamFilter) return false;
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter !== 'All' && u.status !== statusFilter) return false;
    if (search) {
      const matchName = u.name.toLowerCase().includes(search.toLowerCase());
      const matchEmail = u.email.toLowerCase().includes(search.toLowerCase());
      const matchSkill = u.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
      return matchName || matchEmail || matchSkill;
    }
    return true;
  });

  const clearAllFilters = () => {
    setDeptFilter('All');
    setTeamFilter('All');
    setRoleFilter('All');
    setStatusFilter('All');
    setSearch('');
  };

  const hasActiveFilters = deptFilter !== 'All' || teamFilter !== 'All' || roleFilter !== 'All' || statusFilter !== 'All' || search !== '';

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(prev => prev.filter(uid => uid !== id));
    } else {
      setSelectedUserIds(prev => [...prev, id]);
    }
  };

  const handleSyncDirectory = () => {
    showToast('Directory Synchronized', 'Okta & Active Directory HR sync completed successfully.', 'success');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Member Directory
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 font-mono">
              {users.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Enterprise workforce directory, skill matrices, and team allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncDirectory}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
            <span>Sync Directory</span>
          </button>

          <button
            id="invite-member-btn"
            onClick={() => setIsInviteMemberOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Teams</option>
            {teams.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Department Head">Department Head</option>
            <option value="Team Lead">Team Lead</option>
            <option value="Senior Engineer">Senior Engineer</option>
            <option value="AI Researcher">AI Researcher</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Designer">Designer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Away">Away</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 text-[11px]">Active Filters:</span>
              {deptFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] border border-blue-500/30">
                  <span>Dept: {deptFilter}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setDeptFilter('All')} />
                </span>
              )}
              {teamFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] border border-blue-500/30">
                  <span>Team: {teamFilter}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTeamFilter('All')} />
                </span>
              )}
              {roleFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] border border-blue-500/30">
                  <span>Role: {roleFilter}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setRoleFilter('All')} />
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] border border-blue-500/30">
                  <span>&quot;{search}&quot;</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
                </span>
              )}
            </div>

            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              CLEAR ALL
            </button>
          </div>
        )}
      </div>

      {/* Members Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950/40 font-semibold">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4">MEMBER</th>
                <th className="py-3 px-4">ROLE & EXPERTISE</th>
                <th className="py-3 px-4">DEPARTMENT / TEAM</th>
                <th className="py-3 px-4">PROJECTS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">LAST ACTIVE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                const statusDot = {
                  'Active': 'bg-emerald-400',
                  'Away': 'bg-amber-400',
                  'Offline': 'bg-slate-500',
                }[user.status];

                const statusBadge = {
                  'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  'Away': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  'Offline': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                }[user.status];

                return (
                  <tr key={user.id} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-blue-600/10' : ''}`}>
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectUser(user.id)}
                        className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                      />
                    </td>

                    {/* Member */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500/30" />
                          <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-slate-900 ${statusDot}`} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 text-xs">{user.name}</div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Skills */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-200 text-xs">{user.role}</div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {user.skills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Department / Team */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-200 text-xs">{user.department}</div>
                        <div className="text-[11px] text-slate-400">{user.team}</div>
                      </div>
                    </td>

                    {/* Projects */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-xs">
                        {user.projectsCount} Projects
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                        {user.status}
                      </span>
                    </td>

                    {/* Last Active / Location */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="text-xs text-slate-300 font-mono">{user.lastActive}</div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{user.location}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200 font-mono">{filteredUsers.length}</strong> of{' '}
            <strong className="text-slate-200 font-mono">{users.length}</strong> specialists
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-xs">1</button>
            <button className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs">2</button>
            <button className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
