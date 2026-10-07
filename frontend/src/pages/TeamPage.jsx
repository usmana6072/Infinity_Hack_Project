import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Topbar from '../components/Topbar';
import { Users, Shield, Briefcase, Code } from 'lucide-react';

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await api.getTeam();
        setUsers(res.users || []);
      } catch (err) {
        setError(err.message || 'Failed to load team directory');
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield size={16} />;
      case 'MANAGER':
        return <Briefcase size={16} />;
      default:
        return <Code size={16} />;
    }
  };

  return (
    <div>
      <Topbar
        title="NovaWorks Team Directory"
        actions={<span className="badge">{users.length} Active Members</span>}
      />

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="empty">Loading team directory...</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Reference ID</th>
                <th>Role</th>
                <th>Specialization</th>
                <th>Skills & Competencies</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="strong">{u.name}</div>
                  </td>
                  <td>
                    <code>{u.id}</code>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? '' : u.role === 'MANAGER' ? 'amber' : 'green'}`} style={{ gap: '6px' }}>
                      {getRoleIcon(u.role)}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td>
                    <span className="muted">{u.specialization || 'N/A'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {u.skills?.map((skill, idx) => (
                        <span key={idx} className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
