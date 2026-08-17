import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Bell, 
  Key, 
  CreditCard, 
  Save, 
  Check, 
  Sparkles, 
  Globe, 
  Building2, 
  Lock, 
  Cpu, 
  Webhook,
  Layers,
  Database,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'api' | 'billing'>('general');

  // Form states
  const [orgName, setOrgName] = useState('Sangam Global Technologies Inc.');
  const [domain, setDomain] = useState('sangam.internal');
  const [timezone, setTimezone] = useState('America/New_York (UTC-05:00)');
  const [region, setRegion] = useState('us-east-1 (N. Virginia)');

  // Feature Toggles
  const [aiPredictive, setAiPredictive] = useState(true);
  const [realtimeTelemetry, setRealtimeTelemetry] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [strictSso, setStrictSso] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Configuration Saved', 'Organization settings updated across distributed hubs.', 'success');
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          System Settings & Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Manage organizational preferences, integration webhooks, and enterprise security compliance.
        </p>
      </div>

      {/* Main Grid: Left Tabs + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Navigation Tabs (3.5 cols on lg, horizontal scrollbar on mobile) */}
        <div className="lg:col-span-3 flex lg:flex-col overflow-x-auto pb-2 lg:pb-0 gap-2 scrollbar-none">
          {[
            { id: 'general', label: 'General Settings', icon: Building2 },
            { id: 'security', label: 'Security & SSO', icon: ShieldCheck },
            { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
            { id: 'api', label: 'API & Integrations', icon: Key },
            { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 lg:w-full transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="hidden lg:block mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Platform Tier</span>
            </div>
            <div>Z-Sangam Enterprise V4.8-LTS</div>
            <div className="text-[11px] text-emerald-400 font-semibold font-mono">SOC2 Type II Certified</div>
          </div>
        </div>

        {/* Right Settings Container (8.5 cols) */}
        <div className="lg:col-span-9 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
          
          {/* Tab 1: General */}
          {activeTab === 'general' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-100">Organization Profile & Parameters</h2>
                <p className="text-xs text-slate-400 mt-0.5">Define canonical enterprise identifying attributes</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Corporate Domain
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Primary Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="America/New_York (UTC-05:00)">Eastern Time (US & Canada) UTC-05:00</option>
                    <option value="America/Los_Angeles (UTC-08:00)">Pacific Time (US & Canada) UTC-08:00</option>
                    <option value="Europe/London (UTC+00:00)">London / UTC+00:00</option>
                    <option value="Asia/Kolkata (UTC+05:30)">India Standard Time UTC+05:30</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Data Residency Cloud Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="us-east-1 (N. Virginia)">AWS us-east-1 (N. Virginia, US)</option>
                    <option value="eu-central-1 (Frankfurt)">AWS eu-central-1 (Frankfurt, EU)</option>
                    <option value="ap-southeast-1 (Singapore)">AWS ap-southeast-1 (Singapore, APAC)</option>
                  </select>
                </div>
              </div>

              {/* Interface Theme Selection */}
              <div className="border-t border-slate-800 pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold text-slate-200">
                    Interface Theme & Color Palette
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Select your desired visual display theme. Both themes comply with high-contrast accessibility standards.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Dark Mode Card */}
                  <div
                    onClick={() => {
                      setTheme('dark');
                      showToast('Theme Changed', 'Switched to Deep Void Slate dark theme.', 'info');
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-blue-500 shadow-lg shadow-blue-900/20 ring-1 ring-blue-500'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-slate-200">Deep Void Slate</span>
                      </div>
                      {theme === 'dark' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center px-3 gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-slate-400 ml-auto font-mono">#030712</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Optimized for low-light engineering focus and OLED efficiency.
                    </p>
                  </div>

                  {/* Light Mode Card (Navy Blue & White) */}
                  <div
                    onClick={() => {
                      setTheme('light');
                      showToast('Theme Changed', 'Switched to Executive Navy Blue & Pure White theme.', 'info');
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'bg-slate-950 border-blue-500 shadow-lg shadow-blue-900/20 ring-1 ring-blue-500'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-slate-200">Executive Navy Blue & White</span>
                      </div>
                      {theme === 'light' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="h-10 rounded-lg bg-white border border-slate-200 flex items-center px-3 gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0a192f]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <span className="text-[10px] text-[#0a192f] ml-auto font-mono font-bold">#FFFFFF & Navy</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Crisp white background with deep navy blue headers and typography.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="border-t border-slate-800 pt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Platform Capabilities & Intelligence Flags
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-200">AI-Powered Predictive Velocity Engine</div>
                      <div className="text-[11px] text-slate-400">Transformer-based milestone risk detection and blockers forecast</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiPredictive(!aiPredictive)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${aiPredictive ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${aiPredictive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-200">Real-Time Telemetry & SSE Sync</div>
                      <div className="text-[11px] text-slate-400">Stream live task moves and commit signals across all open client tabs</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRealtimeTelemetry(!realtimeTelemetry)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${realtimeTelemetry ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${realtimeTelemetry ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-200">Automated GitHub / GitLab Telemetry Sync</div>
                      <div className="text-[11px] text-slate-400">Ingest pull requests and code velocity metrics every 15 minutes</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoSync(!autoSync)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${autoSync ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoSync ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-200">Strict Multi-Factor SSO Enforcement</div>
                      <div className="text-[11px] text-slate-400">Mandate hardware security key (FIDO2/WebAuthn) for administrative operations</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStrictSso(!strictSso)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${strictSso ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${strictSso ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit footer */}
              <div className="pt-6 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  id="save-settings-btn"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-100">Enterprise Security & Identity Provider</h2>
                <p className="text-xs text-slate-400 mt-0.5">SAML 2.0 / OIDC configurations and active audit logs</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <span>Okta SSO Active • 842 Identifiers Synchronized • Zero Trust Network Enforced</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">SAML 2.0 Identity Provider URL</div>
                    <div className="font-mono text-slate-400 text-[11px] mt-0.5">https://auth.sangam.internal/idp/saml2/sso</div>
                  </div>
                  <button onClick={() => showToast('SSO Config', 'SAML metadata certificate exported.', 'info')} className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300 font-semibold hover:bg-slate-700">
                    Export Metadata
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-100">Notification Routing & Webhook Alerts</h2>
                <p className="text-xs text-slate-400 mt-0.5">Dispatch urgent sprint blockers to Slack, Microsoft Teams, and PagerDuty</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Slack Dispatch Channel</div>
                    <div className="text-[11px] text-slate-400">#engineering-alerts-prod (Connected)</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CONNECTED</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: API */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-100">REST & GraphQL API Credentials</h2>
                <p className="text-xs text-slate-400 mt-0.5">Authenticate programmatic clients and CI/CD pipelines</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">API KEY (PRODUCTION)</span>
                  <span className="text-blue-400 font-bold">zs_live_99f82ab74182903e...e481b</span>
                </div>
                <button
                  onClick={() => showToast('Copied', 'API Key copied to clipboard.', 'success')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 font-sans font-semibold"
                >
                  Copy Key
                </button>
              </div>
            </div>
          )}

          {/* Tab 5: Billing */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-100">Enterprise License & Quota</h2>
                <p className="text-xs text-slate-400 mt-0.5">Global Organization Unlimited Tier</p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-900/40 to-slate-950 border border-blue-500/30 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400">Current Plan</div>
                <div className="text-xl font-bold text-slate-100">Z-Sangam Enterprise Elite</div>
                <div className="text-xs text-slate-300">Unlimited seats, 99.99% SLA guarantee, Dedicated Technical Account Manager</div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
