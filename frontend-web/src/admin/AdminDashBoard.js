import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../theme/ThemeContext';
import { useAuth }  from '../auth/AuthContext';
import API_BASE from '../config';

export default function AdminDashboard({ onBack }) {
  const { theme }              = useTheme();
  const { token }              = useAuth();
  const [data,    setData]     = useState(null);
  const [users,   setUsers]    = useState([]);
  const [tab,     setTab]      = useState('overview');
  const [loading, setLoading]  = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/api/v1/admin/dashboard`, { headers }),
      axios.get(`${API_BASE}/api/v1/admin/users`,     { headers }),
    ]).then(([d, u]) => {
      setData(d.data);
      setUsers(u.data.users || []);
    }).catch(e => {
      console.error('Admin fetch failed:', e.message);
    }).finally(() => setLoading(false));
  }, []);

  const toggleUser = async (userId) => {
    await axios.patch(`${API_BASE}/api/v1/admin/users/${userId}/toggle-active`, {}, { headers });
    setUsers(u => u.map(user =>
      user.id === userId ? { ...user, is_active: !user.is_active } : user
    ));
  };

  const purge = async () => {
    if (!window.confirm('Delete all detections older than 30 days?')) return;
    const r = await axios.delete(`${API_BASE}/api/v1/admin/detections/purge`, { headers });
    alert(`Deleted ${r.data.deleted} detections`);
  };

  if (loading) return (
    <div style={{ color: theme.text, padding: '60px', textAlign: 'center' }}>
      Loading admin data...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: theme.background, padding: '30px 20px', color: theme.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button onClick={onBack} style={{
          background: theme.surface, border: `1px solid ${theme.border}`,
          color: theme.text, padding: '8px 16px', borderRadius: '20px', cursor: 'pointer'
        }}>← Back</button>
        <h2 style={{ margin: 0 }}>🛡️ Admin Dashboard</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
        {['overview', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 24px', borderRadius: '20px', border: 'none',
            cursor: 'pointer', fontWeight: 'bold',
            background: tab === t ? '#667eea' : theme.surface,
            color: tab === t ? 'white' : theme.textMuted
          }}>
            {t === 'overview' ? '📊 Overview' : '👥 Users'}
          </button>
        ))}
      </div>

      {tab === 'overview' && data && (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '16px', marginBottom: '30px', maxWidth: '900px' }}>
            {[
              { label: 'Total Users',       value: data.users.total },
              { label: 'Total Detections',  value: data.detections.total },
              { label: 'Detections Today',  value: data.detections.today },
              { label: 'This Week',         value: data.detections.this_week },
              { label: 'Avg Process Time',  value: `${data.detections.avg_time_sec}s` },
            ].map(s => (
              <div key={s.label} style={{
                background: theme.surface, borderRadius: '14px', padding: '20px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72em', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: theme.text }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Verdict Breakdown */}
          <div style={{ background: theme.surface, borderRadius: '16px', padding: '24px', maxWidth: '600px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>Verdict Breakdown</h3>
            {Object.entries(data.detections.by_verdict || {}).map(([v, c]) => (
              <div key={v} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
                <span>{v}</span>
                <strong>{c}</strong>
              </div>
            ))}
          </div>

          <button onClick={purge} style={{
            background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.4)',
            color: '#e74c3c', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer'
          }}>
            🗑️ Purge Detections Older Than 30 Days
          </button>
        </>
      )}

      {tab === 'users' && (
        <div style={{ background: theme.surface, borderRadius: '16px', overflow: 'hidden', maxWidth: '900px' }}>
          {users.map(u => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 20px', borderBottom: `1px solid ${theme.border}`
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: theme.text, fontWeight: '600' }}>{u.username}</div>
                <div style={{ color: theme.textMuted, fontSize: '0.8em' }}>{u.email}</div>
              </div>
              <div style={{ color: theme.textMuted, fontSize: '0.8em', textAlign: 'right' }}>
                <div>{u.detections} detections</div>
                {u.is_admin && <div style={{ color: '#667eea' }}>Admin</div>}
              </div>
              <button onClick={() => toggleUser(u.id)} style={{
                background: u.is_active ? 'rgba(231,76,60,0.15)' : 'rgba(39,174,96,0.15)',
                border: `1px solid ${u.is_active ? 'rgba(231,76,60,0.4)' : 'rgba(39,174,96,0.4)'}`,
                color: u.is_active ? '#e74c3c' : '#27ae60',
                padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82em'
              }}>
                {u.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}