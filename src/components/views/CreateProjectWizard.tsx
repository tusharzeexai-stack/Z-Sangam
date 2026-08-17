import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Save, 
  X, 
  FolderKanban, 
  Building2, 
  Users2, 
  UserCheck, 
  FileCheck2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';

export const CreateProjectWizard: React.FC = () => {
  const { 
    departments, 
    teams, 
    users, 
    addProject, 
    setActiveView, 
    setSelectedProjectId,
    showToast 
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState('Neural Ingestion Gateway 3.0');
  const [code, setCode] = useState('ZS-PROJ-058');
  const [description, setDescription] = useState('High-throughput real-time Kafka event processor with transformer vector indexing and automated failover routing.');
  const [leadName, setLeadName] = useState('Sarah Jenkins');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [startDate, setStartDate] = useState('2023-09-01');
  const [targetEndDate, setTargetEndDate] = useState('2023-12-15');

  // Step 2: Department
  const [selectedDept, setSelectedDept] = useState(departments[0]?.name || 'Engineering');

  // Step 3: Teams
  const [selectedTeams, setSelectedTeams] = useState<string[]>(['Frontend Engineering', 'Backend Systems']);

  // Step 4: Members
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(['usr-002', 'usr-003', 'usr-004']);

  const steps = [
    { num: 1, title: 'PROJECT INFO', icon: FolderKanban },
    { num: 2, title: 'DEPARTMENT', icon: Building2 },
    { num: 3, title: 'TEAMS', icon: Users2 },
    { num: 4, title: 'MEMBERS', icon: UserCheck },
    { num: 5, title: 'REVIEW', icon: FileCheck2 },
  ];

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) {
      showToast('Validation Error', 'Please specify a project name.', 'warning');
      return;
    }
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      setActiveView('projects');
    }
  };

  const handleFinalSubmit = () => {
    const leadUser = users.find(u => u.name === leadName) || users[0];
    const assignedMembers = users
      .filter(u => selectedMemberIds.includes(u.id))
      .map(u => ({ id: u.id, name: u.name, avatar: u.avatar, role: u.role }));

    const created = addProject({
      name,
      code,
      description,
      department: selectedDept,
      teams: selectedTeams,
      leadName: leadUser.name,
      leadAvatar: leadUser.avatar,
      members: assignedMembers,
      startDate,
      targetEndDate,
      priority: priority as any,
      progressPct: 0
    });

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setSelectedProjectId(created.id);
    setActiveView('project-detail');
  };

  const handleSaveDraft = () => {
    showToast('Draft Saved', 'Project configuration stored locally.', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INITIATIVE CREATION WIZARD</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Create New Project
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Follow the steps below to define project scope, allocate resources, and establish timelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => setActiveView('projects')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-semibold"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="grid grid-cols-5 gap-2 bg-slate-900/60 border border-slate-800/80 p-2 rounded-xl">
        {steps.map((step) => {
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <button
              key={step.num}
              onClick={() => {
                if (step.num <= currentStep) setCurrentStep(step.num);
              }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${
                isCurrent
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : isDone
                    ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                isCurrent
                  ? 'bg-white text-blue-600'
                  : isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
              }`}>
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : step.num}
              </div>
              <span className="text-[11px] font-bold tracking-tight truncate hidden md:inline">
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        
        {/* Step 1: Project Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100">Step 1: Project Identification & Priority</h2>
              <p className="text-xs text-slate-400 mt-0.5">Specify fundamental initiative attributes and metadata</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Next-Gen Core Platform"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Project Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ZS-PROJ-045"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Description & Architectural Scope
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail high-level deliverables, dependencies, and business impact..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-4 text-xs text-slate-100 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Designated Project Lead
                </label>
                <select
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.name}>{u.name} — {u.role} ({u.department})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        priority === p
                          ? p === 'High'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : p === 'Medium'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-700 border-slate-500 text-slate-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Target Delivery Date
                </label>
                <input
                  type="date"
                  value={targetEndDate}
                  onChange={(e) => setTargetEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Department Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100">Step 2: Department Allocation</h2>
              <p className="text-xs text-slate-400 mt-0.5">Assign primary organizational unit responsible for project delivery</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((dept) => {
                const isSelected = selectedDept === dept.name;
                return (
                  <div
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-600/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        {dept.code}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-100">{dept.name}</div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">{dept.description}</div>
                    <div className="mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                      Head: <strong className="text-slate-300">{dept.headName}</strong> • {dept.membersCount} Members
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Teams Allocation */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100">Step 3: Cross-Functional Team Selection</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select squads that will collaborate on sprint tickets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((t) => {
                const isSelected = selectedTeams.includes(t.name);
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTeams(prev => prev.filter(item => item !== t.name));
                      } else {
                        setSelectedTeams(prev => [...prev, t.name]);
                      }
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-600/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        {t.shortTag}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-100">{t.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.focusArea}</div>
                    <div className="mt-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                      Lead: <strong className="text-slate-300">{t.leadName}</strong> • {t.membersCount} Engineers
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Member Selection */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100">Step 4: Key Personnel & Specialist Assignment</h2>
              <p className="text-xs text-slate-400 mt-0.5">Assign individual contributors and technical reviewers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {users.map((u) => {
                const isSelected = selectedMemberIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMemberIds(prev => prev.filter(id => id !== u.id));
                      } else {
                        setSelectedMemberIds(prev => [...prev, u.id]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 shadow-sm shadow-blue-600/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500/30" />
                      <div>
                        <div className="text-xs font-bold text-slate-100">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.role}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Review & Deploy */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100">Step 5: Review & Initialize Initiative</h2>
              <p className="text-xs text-slate-400 mt-0.5">Confirm parameters before broadcasting to organizational sync stream</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">PROJECT</span>
                  <div className="text-sm font-bold text-slate-100 mt-0.5">{name} ({code})</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">LEAD DEPARTMENT</span>
                  <div className="text-xs font-semibold text-blue-400 mt-0.5">{selectedDept}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">TIMELINE</span>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">{startDate} → {targetEndDate}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">COLLABORATING TEAMS ({selectedTeams.length})</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTeams.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ASSIGNED PERSONNEL ({selectedMemberIds.length})</span>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Lead: <strong>{leadName}</strong> + {selectedMemberIds.length} specialists
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">PRIORITY</span>
                  <div className="mt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {priority} PRIORITY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          <button
            id="wizard-continue-btn"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <span>{currentStep === 5 ? 'Deploy Initiative' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
