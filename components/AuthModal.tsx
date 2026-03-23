'use client';
import { useState, useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import './AuthModal.css';

interface AuthModalProps { isOpen: boolean; onClose: () => void; }

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  useEffect(() => { if (isOpen) setMode('signin'); }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal-wrap" onClick={e => e.stopPropagation()}>
        <div className="auth-modal">
          <div className="auth-watermark">Kalku<em>nesia</em></div>
          <button className="auth-close" onClick={onClose}>×</button>
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h2 className="auth-title">{mode === 'signin' ? 'Login untuk Simpan History' : 'Daftar Akun Baru'}</h2>
            <p className="auth-subtitle">Simpan dan akses kembali hasil kalkulasi kamu kapanpun</p>
          </div>
          <div className="auth-body auth-body--hide-footer">
            {mode === 'signin'
              ? <SignIn routing="hash" forceRedirectUrl="/dashboard" signUpUrl="/sign-up" />
              : <SignUp routing="hash" forceRedirectUrl="/dashboard" signInUrl="/sign-in" />
            }
          </div>
          <div className="auth-toggle">
            {mode === 'signin'
              ? <>Don&apos;t have an account? <button onClick={() => setMode('signup')}>Sign up</button></>
              : <>Already have an account? <button onClick={() => setMode('signin')}>Sign in</button></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
