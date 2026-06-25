import { useState } from 'react';
import { login, register } from '../lib/api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const attempt = async (fn) => {
    setError('');
    setLoading(true);
    try {
      const { access_token } = await fn(username.trim(), pin);
      onLogin(access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-title">DAILY LOG</div>
        <div className="login-sub">Enter your username and PIN to continue</div>
        <div className="field">
          <label className="field-label">Username</label>
          <input type="text" placeholder="anup" value={username}
            onChange={e => setUsername(e.target.value)} autoCapitalize="none" />
        </div>
        <div className="field">
          <label className="field-label">PIN / Password</label>
          <input type="password" placeholder="••••" value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && attempt(login)} />
        </div>
        {error && <div className="login-error">{error}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn-primary" style={{ flex: 1 }}
            onClick={() => attempt(login)} disabled={loading}>
            {loading ? '…' : 'Log in'}
          </button>
          <button className="btn-secondary" style={{ flex: 1 }}
            onClick={() => attempt(register)} disabled={loading}>
            {loading ? '…' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
