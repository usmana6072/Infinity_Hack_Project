import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Topbar from '../components/Topbar';
import GlassBanner from '../components/GlassBanner';
import { Users, Shield, Briefcase, Code, UserPlus, Search, X, CheckCircle2 } from 'lucide-react';

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('AGENT');
  const [specialization, setSpecialization] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [password, setPassword] = useState('Demo123!');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadTeam = async () => {
    try {
      const res = await api.getTeam();
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load team directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleOpenModal = () => {
    setName('');
    setEmail('');
    setRole('AGENT');
    setSpecialization('');
    setSkillsStr('');
    setPassword('Demo123!');
    setCreateError('');
    setModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setCreateError('Name and email are required.');
      return;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
      const skills = skillsStr
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const newUser = await api.createUser({
        name: name.trim(),
        email: email.trim(),
        role,
        specialization: specialization.trim() || 'Agent / Developer',
        skills,
        password: password.trim() || 'Demo123!',
      });

      setUsers(prev => [...prev, newUser]);
      setModalOpen(false);
    } catch (err) {
      setCreateError(err.message || 'Failed to add developer/agent.');
    } finally {
      setCreateLoading(false);
    }
  };

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

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    (u.specialization && u.specialization.toLowerCase().includes(search.toLowerCase())) ||
    (u.skills && u.skills.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div>
      <Topbar
        title="NovaWorks Team Directory"
        actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge">{users.length} Active Members</span>
            {user?.role === 'ADMIN' && (
              <button className="btn primary small" onClick={handleOpenModal}>
                <UserPlus size={16} />
                <span>Add Developer / Agent</span>
              </button>
            )}
          </div>
        }
      />

      <GlassBanner
        badge="ENGINEERING ROSTER"
        badgeColor="orange"
        title="NovaWorks Verified Agent & Specialist Directory"
        description="Inspect member security roles, skills matrix, and specializations. Administrators can provision new agents."
        stats={[
          { label: 'Active Roster', value: `${users.length} Engineers`, color: '#ea580c' },
          { label: 'Agent Auth', value: 'JWT Encrypted', color: '#16a34a' }
        ]}
      />

      {error && <div className="alert error">{error}</div>}

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', maxWidth: '380px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by name, ID, skill, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: '38px' }}
        />
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
      </div>

      {loading ? (
        <div className="empty">Loading team directory...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="card empty">
          <Users size={40} style={{ color: '#94a3b8', marginBottom: '12px' }} />
          <h3>No team members found</h3>
          <p className="muted">No member matched your search query "{search}".</p>
        </div>
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
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="strong">{u.name}</div>
                  </td>
                  <td>
                    <code>{u.id}</code>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'gray' : u.role === 'MANAGER' ? 'amber' : 'green'}`} style={{ gap: '6px' }}>
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
                        <span key={idx} className="badge" style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', fontSize: '11px' }}>
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

      {/* Add Developer / Agent Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Add New Team Member</h3>
              <button className="btn ghost" onClick={() => setModalOpen(false)} style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {createError && <div className="alert error">{createError}</div>}

            <form onSubmit={handleCreateUser}>
              <label>
                Full Name
                <input
                  type="text"
                  placeholder="e.g. Farhan Ali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  placeholder="e.g. farhan@novaworks.example"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Role
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="AGENT">Developer Agent (AGENT)</option>
                    <option value="MANAGER">Project Manager (MANAGER)</option>
                  </select>
                </label>

                <label>
                  Specialization
                  <input
                    type="text"
                    placeholder="e.g. Backend / Python"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                </label>
              </div>

              <label>
                Skills (comma-separated)
                <input
                  type="text"
                  placeholder="e.g. Python, FastAPI, Docker, Microservices"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                />
              </label>

              <label>
                Initial Password
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setModalOpen(false)}
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Create Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
