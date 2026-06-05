import React, { useState } from 'react';
import { Crown, X, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!username.trim() || username.length < 3) {
          setError('Username must be at least 3 characters.');
          setLoading(false);
          return;
        }

        // Check if username taken
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.trim())
          .maybeSingle();

        if (existing) {
          setError('Username already taken. Choose another.');
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            username: username.trim(),
          });

          if (profileError && !profileError.message.includes('duplicate')) {
            setError('Account created but profile setup failed. Please sign in.');
          }
        }

        onSuccess();
        onClose();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message === 'Invalid login credentials'
            ? 'Invalid email or password.'
            : signInError.message);
          setLoading(false);
          return;
        }

        onSuccess();
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(7,7,10,0.9)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000,
        padding: 24,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 440,
        background: '#0D0D14',
        border: '1px solid rgba(123,47,247,0.25)',
        borderRadius: 24,
        boxShadow: '0 0 60px rgba(123,47,247,0.2), 0 40px 80px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative',
      }}>
        {/* Glow top border */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #7B2FF7, #3A86FF, transparent)',
        }} />

        {/* Header */}
        <div style={{
          padding: '28px 32px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Crown size={24} fill="#7B2FF7" color="#7B2FF7"
              style={{ filter: 'drop-shadow(0 0 8px rgba(123,47,247,0.8))' }} />
            <span style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Poppins',
              background: 'linear-gradient(135deg, #9B4FFF, #3A86FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '0.06em' }}>
              VCHESS
            </span>
          </div>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '6px', cursor: 'pointer', color: '#606078',
              display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,51,102,0.1)'; e.currentTarget.style.color = '#FF3366'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#606078'; }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '24px 32px 32px' }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: 4, gap: 4, marginBottom: 28 }}>
            {(['login', 'register'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{ flex: 1, padding: '10px',
                  background: mode === m ? 'rgba(123,47,247,0.2)' : 'transparent',
                  border: mode === m ? '1px solid rgba(123,47,247,0.35)' : '1px solid transparent',
                  borderRadius: 8, cursor: 'pointer',
                  color: mode === m ? '#9B4FFF' : '#606078',
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                {m === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />}
                {m === 'login' ? 'SIGN IN' : 'REGISTER'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                  USERNAME
                </label>
                <input
                  className="input-futuristic"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose your callsign"
                  required
                  minLength={3}
                  maxLength={24}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 14 }}
                />
              </div>
            )}

            <div>
              <label style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                EMAIL
              </label>
              <input
                className="input-futuristic"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ color: '#A0A0B8', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-futuristic"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: 10, fontSize: 14 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#606078',
                    display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#9B4FFF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#606078'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8,
                background: 'rgba(255,51,102,0.08)',
                border: '1px solid rgba(255,51,102,0.2)',
                borderRadius: 8, padding: '10px 12px' }}>
                <AlertCircle size={14} color="#FF3366" style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ color: '#FF3366', fontSize: 12 }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: 12,
                fontSize: 14, fontWeight: 800, letterSpacing: '0.08em',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
              }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.7s linear infinite' }} />
                  {mode === 'login' ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}
                </>
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
                  {mode === 'login' ? 'ENTER VCHESS' : 'JOIN VCHESS'}
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#606078', fontSize: 12, marginTop: 20 }}>
            {mode === 'login' ? "Don't have an account? " : "Already a member? "}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: '#9B4FFF', fontSize: 12, fontWeight: 700,
                textDecoration: 'underline', textDecorationColor: 'rgba(155,79,255,0.3)' }}>
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
