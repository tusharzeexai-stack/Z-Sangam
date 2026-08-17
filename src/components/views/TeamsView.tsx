import React, { useState } from 'react';
import { 
  Users2, 
  Users,
  Search, 
  Plus, 
  LayoutGrid, 
  ListFilter, 
  ChevronRight, 
  ChevronLeft,
  Pencil,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Team } from '../../types';
import { TeamMembersModal } from '../common/TeamMembersModal';

export const TeamsView: React.FC = () => {
  const { 
    teams, 
    departments, 
    projects,
    setIsTeamModalOpen,
    setEditingTeam,
    deleteTeam
  } = useApp();

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null);

  const filteredTeams = teams.filter(t => {
    if (selectedDeptFilter !== 'All' && t.department !== selectedDeptFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeProjectsCount = projects.filter(p => p.status === 'In Progress' || p.status === 'in_progress').length;
  const avgHealthScore = teams.length 
    ? Math.round(teams.reduce((acc, t) => acc + (t.completionRatePct || 100), 0) / teams.length) 
    : 100;

  const handleOpenNewModal = () => {
    setEditingTeam(null);
    setIsTeamModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setIsTeamModalOpen(true);
  };

  const handleDeleteTeam = (team: Team) => {
    if (window.confirm(`Are you sure you want to delete squad "${team.name}"?`)) {
      deleteTeam(team.id);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Teams Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage departmental structures, oversee team leadership, and track cross-functional collaboration across the organization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <button
            id="create-team-btn"
            onClick={handleOpenNewModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Team</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TOTAL TEAMS</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">+{teams.length} Squads</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-2">{teams.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Cross-functional units active</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ACTIVE PROJECTS</span>
            <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">{activeProjectsCount > 0 ? 'Active Load' : 'Normal Load'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-2">{activeProjectsCount}</div>
          <div className="text-[10px] text-slate-400 mt-1">Across entire organization</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TEAM HEALTH SCORE</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">{avgHealthScore >= 80 ? 'Optimum' : 'Review Required'}</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-2">{avgHealthScore}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Efficiency benchmark met</div>
        </div>
      </div>

      {/* Filter and View bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'table' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
            <Users2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No teams found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {search || selectedDeptFilter !== 'All' 
              ? 'No squad matching your search query or department filter.' 
              : 'Initialize your organization structure by provisioning your first team.'}
          </p>
          <button
            onClick={handleOpenNewModal}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Team</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-950/40 font-semibold">
                <tr>
                  <th className="py-3 px-4">TEAM NAME</th>
                  <th className="py-3 px-4">DEPARTMENT</th>
                  <th className="py-3 px-4">TEAM LEAD</th>
                  <th className="py-3 px-4">MEMBERS</th>
                  <th className="py-3 px-4">PROJECTS COMPLETED</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredTeams.map((team) => {
                  const statusStyles = {
                    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    'Hiring': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    'Restructuring': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  }[team.status] || 'bg-slate-800 text-slate-300 border-slate-700';

                  return (
                    <tr key={team.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400 font-mono">
                            {team.shortTag}
                          </div>
                          <div>
                            <div 
                              onClick={() => setSelectedTeamForMembers(team)}
                              className="font-bold text-slate-100 hover:text-blue-400 cursor-pointer transition-colors"
                              title="Click to view and manage team members"
                            >
                              {team.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">{team.code}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          {team.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img src={team.leadAvatar} alt={team.leadName} className="w-6 h-6 rounded-full object-cover ring-1 ring-blue-500/30" />
                          <span className="text-slate-200">{team.leadName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        <button
                          onClick={() => setSelectedTeamForMembers(team)}
                          title="Click to view and manage team members"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-semibold border border-blue-500/20 transition-all hover:scale-105"
                        >
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span>{team.membersCount} Member{team.membersCount === 1 ? '' : 's'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-mono">{team.activeProjectsCount} Projects</span>
                            <span className="font-bold text-slate-200 font-mono">{team.completionRatePct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${team.completionRatePct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md border ${statusStyles}`}>
                          {team.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTeamForMembers(team)}
                            title="Manage Members"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditTeam(team)}
                            title="Edit Team"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team)}
                            title="Delete Team"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <strong className="text-slate-200 font-mono">{filteredTeams.length}</strong> of{' '}
              <strong className="text-slate-200 font-mono">{teams.length}</strong> total teams
            </div>

            <div className="flex items-center gap-1">
              <button className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-xs">1</button>
              <button className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {team.shortTag}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {team.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedTeamForMembers(team)}
                      title="Manage Members"
                      className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEditTeam(team)}
                      title="Edit Team"
                      className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team)}
                      title="Delete Team"
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 
                  onClick={() => setSelectedTeamForMembers(team)}
                  className="text-base font-bold text-slate-100 hover:text-blue-400 cursor-pointer transition-colors"
                >
                  {team.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{team.focusArea}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                  <span>{team.department}</span>
                  <button
                    onClick={() => setSelectedTeamForMembers(team)}
                    className="font-mono text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Users className="w-3 h-3 text-blue-400" />
                    {team.membersCount} Member{team.membersCount === 1 ? '' : 's'}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-3">
                <div className="flex items-center gap-2">
                  <img src={team.leadAvatar} alt={team.leadName} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-slate-200">{team.leadName}</span>
                </div>
                <span className="font-bold text-blue-400 font-mono">{team.completionRatePct}% Completed</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Members Modal */}
      <TeamMembersModal
        team={selectedTeamForMembers}
        onClose={() => setSelectedTeamForMembers(null)}
      />
    </div>
  );
};
