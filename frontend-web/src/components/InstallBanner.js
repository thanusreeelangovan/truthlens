import React, { useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';

export default function InstallBanner() {
  const { theme }      = useTheme();
  const [prompt, setPrompt] = useState(null);
  const [show,   setShow]   = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '50%',
      transform: 'translateX(-50%)', zIndex: 1000,
      background: theme.card, borderRadius: '16px',
      padding: '16px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', gap: '16px',
      maxWidth: '360px', width: '90%'
    }}>
      <span style={{ fontSize: '28px' }}>📱</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', color: theme.cardText, fontSize: '0.95em' }}>
          Install TruthLens
        </div>
        <div style={{ color: '#888', fontSize: '0.8em' }}>
          Add to home screen for quick access
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <button onClick={install} style={{
          background: '#667eea', color: 'white', border: 'none',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
          fontWeight: 'bold', fontSize: '0.85em'
        }}>
          Install
        </button>
        <button onClick={() => setShow(false)} style={{
          background: 'transparent', color: '#888', border: 'none',
          padding: '4px', cursor: 'pointer', fontSize: '0.8em'
        }}>
          Not now
        </button>
      </div>
    </div>
  );
}