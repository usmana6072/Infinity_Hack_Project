import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, UserCheck } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { id: 'ADMIN', name: 'Admin', email: 'admin@novaworks.example', role: 'ADMIN', note: 'Can convert transcripts & see all' },
  { id: 'PM01', name: 'Ayesha Khan', email: 'ayesha@novaworks.example', role: 'MANAGER', note: 'Web PM (UrbanCart)' },
  { id: 'PM02', name: 'Bilal Ahmed', email: 'bilal@novaworks.example', role: 'MANAGER', note: 'Mobile PM (QuickServe)' },
  { id: 'PM03', name: 'Hina Malik', email: 'hina@novaworks.example', role: 'MANAGER', note: 'AI PM (HelpDeskPro)' },
  { id: 'DEV01', name: 'Ali Raza', email: 'ali@novaworks.example', role: 'AGENT', note: 'Full-Stack (UrbanCart 3 tasks)' },
  { id: 'DEV02', name: 'Hamza Shah', email: 'hamza@novaworks.example', role: 'AGENT', note: 'Full-Stack (UrbanCart & QuickServe)' },
  { id: 'DEV03', name: 'Sara Noor', email: 'sara@novaworks.example', role: 'AGENT', note: 'App Dev (QuickServe 2 tasks)' },
  { id: 'DEV04', name: 'Usman Tariq', email: 'usman@novaworks.example', role: 'AGENT', note: 'App Dev (QuickServe 1 task)' },
  { id: 'DEV05', name: 'Zain Abbas', email: 'zain@novaworks.example', role: 'AGENT', note: 'AI Dev (HelpDeskPro 2 tasks)' },
  { id: 'DEV06', name: 'Maryam Asif', email: 'maryam@novaworks.example', role: 'AGENT', note: 'AI Dev (HelpDeskPro 2 tasks)' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/dashboard');
      } else if (user.role === 'MANAGER') {
        navigate('/projects');
      } else {
        navigate('/my-tasks');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (acc) => {
    setEmail(acc.email);
    setPassword('Demo123!');
    setError('');
  };

  return (
    <section className="login-wrap">
      <div className="ambient-glow orb-1" />
      <div className="ambient-glow orb-2" />
      <div className="ambient-glow orb-3" />
      <div className="ambient-glow orb-4" />
      <div className="login-card">
        <div className="brand big">
          <span className="logo">N</span>
          <span>NovaWorks CRM</span>
        </div>
        <p className="muted" style={{ margin: '4px 0 20px 0' }}>
          Meeting-to-Execution Project Management Platform
        </p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@novaworks.example"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Demo123!"
              autoComplete="current-password"
              required
            />
          </label>

          <button className="btn primary block" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <details className="demo-accounts" open>
          <summary>
            <span>⚡ Quick Demo Accounts (Password: Demo123!)</span>
          </summary>
          <div style={{ marginTop: '10px', maxHeight: '250px', overflowY: 'auto' }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.id}
                className="demo-row"
                onClick={() => handleSelectDemo(acc)}
                title="Click to fill credentials"
              >
                <div>
                  <span className="strong">{acc.name}</span>
                  <span className="muted small" style={{ marginLeft: '8px' }}>({acc.id})</span>
                  <div className="muted small">{acc.note}</div>
                </div>
                <span className={`badge ${acc.role === 'ADMIN' ? '' : acc.role === 'MANAGER' ? 'amber' : 'green'}`}>
                  {acc.role}
                </span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
