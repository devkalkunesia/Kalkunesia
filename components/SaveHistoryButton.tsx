'use client';

import { useState } from 'react';
import { useUser, useAuth } from '@clerk/react';
import { saveHistory } from '@/lib/history';
import { showToast } from '@/lib/utils';
import AuthModal from './AuthModal';
import './SaveHistoryButton.css';

interface SaveHistoryButtonProps {
  toolId: string;
  toolName: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  disabled?: boolean;
}

export default function SaveHistoryButton({ toolId, toolName, inputs, result, disabled }: SaveHistoryButtonProps) {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [state, setState] = useState<'idle' | 'naming' | 'loading' | 'success' | 'error'>('idle');
  const [label, setLabel] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  const handleClick = () => {
    if (!isSignedIn) {
      setShowAuth(true);
      return;
    }
    setState('naming');
  };

  const handleSave = async () => {
    const token = await getToken();
    if (!token || !user?.id || !label.trim()) return;
    setState('loading');
    const { error } = await saveHistory({
      userId: user.id,
      toolId,
      toolName,
      label: label.trim(),
      inputs,
      result,
      token,
    });
    if (error) {
      setState('error');
      showToast('❌ Gagal menyimpan: ' + error);
      setTimeout(() => setState('idle'), 2000);
    } else {
      setState('success');
      showToast('✅ History tersimpan!');
      setTimeout(() => { setState('idle'); setLabel(''); }, 2000);
    }
  };

  const handleCancel = () => {
    setState('idle');
    setLabel('');
  };

  return (
    <>
      {state === 'naming' ? (
        <div className="shb-naming">
          <input
            type="text"
            className="shb-input"
            placeholder="Nama skenario, contoh: KPR Rumah BSD"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && label.trim() && handleSave()}
            autoFocus
          />
          <button className="shb-save" onClick={handleSave} disabled={!label.trim()}>
            Simpan
          </button>
          <button className="shb-cancel" onClick={handleCancel}>
            ✕
          </button>
        </div>
      ) : (
        <button
          className={`action-btn save-history-btn${state === 'success' ? ' success' : ''}${state === 'loading' ? ' loading' : ''}`}
          onClick={handleClick}
          disabled={disabled || state === 'loading' || state === 'success'}
        >
          {state === 'loading' && <span className="shb-spinner" />}
          {state === 'success' ? '✅ Tersimpan' : state === 'loading' ? 'Menyimpan...' : '🔖 Simpan'}
        </button>
      )}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
