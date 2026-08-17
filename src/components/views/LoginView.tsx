import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck,
  Building2,
  Database,
  UserCheck,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ZSangamLogo } from '../common/ZSangamLogo';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AuthService } from '../../services/auth.service';

export const LoginView: React.FC = () => {
  const { login, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setAuthError('Please enter both your username/email and password.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      if (mode === 'signup') {
        const { user, error } = await AuthService.signUp(usernameOrEmail, password, fullName);
        if (error) throw error;
        showToast('Account Created', 'Your enterprise account was successfully registered.', 'success');
        await login(usernameOrEmail, password);
      } else {
        const success = await login(usernameOrEmail, password);
        if (!success) {
          setAuthError('Invalid username or password. Please verify your credentials.');
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="min-h-screen w-full bg-[#080d1a] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Outer Card Shell */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Side: Brand Narrative & Constellation Graphics */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0c1631] via-[#091124] to-[#050914] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
          {/* Subtle Constellation Mesh Background Pattern */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="16" cy="16" r="1.5" fill="#3b82f6" />
                  <path d="M 0 16 L 32 16 M 16 0 L 16 32" stroke="#1e3a8a" strokeWidth="0.5" strokeDasharray="2 4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>

          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <ZSangamLogo size="lg" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-[10px] font-bold text-blue-300">
              <Database className="w-3 h-3 text-blue-400" />
              <span>{isConnected ? 'Supabase Live' : 'Enterprise Engine'}</span>
            </div>
          </div>

          {/* Center Headline */}
          <div className="relative z-10 my-8 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Where Teams, Projects & Progress Meet.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Enterprise-grade project synchronization and PostgreSQL orchestration. Unify multi-department initiatives, workloads, and real-time execution.
            </p>
          </div>

          {/* Bottom Live System Indicator */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="font-semibold tracking-wider text-emerald-400">SYSTEMS OPERATIONAL</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              v3.0 Production
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="lg:col-span-6 bg-slate-900/95 p-8 lg:p-12 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                  {mode === 'login' ? 'Sign in to your workspace' : 'Create Enterprise Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'login' 
                    ? 'Enter your corporate credentials to continue.' 
                    : 'Provision an account under Z-Sangam Organization.'}
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('login'); setAuthError(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setAuthError(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'signup' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                New Registration
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username or Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-username-input"
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Username or Corporate Email"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-slate-300 font-medium">Remember me</span>
                  </label>
                  <a 
                    href="#forgot" 
                    onClick={async (e) => { 
                      e.preventDefault(); 
                      if (usernameOrEmail) {
                        await AuthService.resetPassword(usernameOrEmail);
                        showToast('Reset Dispatched', `Reset link dispatched to ${usernameOrEmail}`, 'info');
                      } else {
                        showToast('Input Required', 'Please enter your username or email above.', 'warning');
                      }
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account & Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              {mode === 'login' ? (
                <span className="text-slate-400 font-medium">
                  Protected by Enterprise Governance & Security
                </span>
              ) : (
                <>
                  Already registered?{' '}
                  <button onClick={() => setMode('login')} className="text-blue-400 hover:underline font-semibold">
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
