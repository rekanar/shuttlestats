import { useState } from 'react';
import { X, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onClose: () => void;
}

export default function LoginModal({ onClose }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      onClose();
    } catch (err: any) {
      const code = err?.code ?? '';
      setError(
        code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')
          ? 'Incorrect email or password.'
          : code.includes('too-many-requests')
            ? 'Too many attempts. Try again later.'
            : err?.message ?? 'Sign in failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="bs-panel-backdrop" onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-sm rounded-2xl border p-6"
        style={{ background: 'rgba(8,22,12,0.97)', borderColor: 'rgba(212,175,55,0.35)', backdropFilter: 'blur(16px)', boxShadow: '0 12px 48px rgba(0,0,0,0.6)' }}
        role="dialog"
        aria-modal="true"
      >
        <button onClick={onClose} className="absolute right-3 top-3 text-amber-400/50 hover:text-amber-300 p-1 rounded-lg hover:bg-white/5">
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={18} className="text-amber-400" />
          <h2 className="text-lg font-black text-amber-300">Admin Sign In</h2>
        </div>
        <p className="text-xs text-amber-200/50 mb-5">
          Only admins can create and edit tournaments. Everyone else can view the dashboard and stats.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1 text-amber-200/60">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="w-full text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-amber-500"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#f0edd6', borderColor: 'rgba(212,175,55,0.3)' }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide mb-1 text-amber-200/60">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-amber-500"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#f0edd6', borderColor: 'rgba(212,175,55,0.3)' }}
            />
          </div>

          {error && (
            <div className="text-xs text-red-300 bg-red-900/40 border border-red-700/40 rounded-lg px-3 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#d4af37,#b8860b)', color: '#0a0a0a', boxShadow: '0 0 12px rgba(212,175,55,0.4)' }}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </>
  );
}
