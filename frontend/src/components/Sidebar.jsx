import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Sparkles, 
  Users, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const roleBadgeColor = {
    ADMIN: '#ec4899',
    MANAGER: '#3b82f6',
    AGENT: '#10b981',
  }[user?.role] || '#6366f1';

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="logo">N</span>
        <span>NovaWorks</span>
      </div>

      <nav id="nav">
        {user?.role === 'ADMIN' && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
              <FolderKanban size={18} />
              <span>All Projects</span>
            </NavLink>
            <NavLink to="/transcript" className={({ isActive }) => isActive ? 'active' : ''}>
              <Sparkles size={18} />
              <span>AI Transcript</span>
            </NavLink>
          </>
        )}

        {user?.role === 'MANAGER' && (
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
            <FolderKanban size={18} />
            <span>My Projects</span>
          </NavLink>
        )}

        {user?.role === 'AGENT' && (
          <>
            <NavLink to="/my-tasks" className={({ isActive }) => isActive ? 'active' : ''}>
              <CheckSquare size={18} />
              <span>My Tasks</span>
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
              <FolderKanban size={18} />
              <span>My Projects</span>
            </NavLink>
          </>
        )}

        <NavLink to="/team" className={({ isActive }) => isActive ? 'active' : ''}>
          <Users size={18} />
          <span>Team Directory</span>
        </NavLink>
      </nav>

      <div className="sidebar-foot">
        <div className="user-chip">
          <div className="avatar" style={{ background: roleBadgeColor }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <div className="strong" style={{ fontSize: '14px' }}>{user?.name}</div>
            <div className="muted small" style={{ color: '#94a3b8' }}>
              {user?.role} • {user?.id}
            </div>
          </div>
        </div>

        <button className="btn ghost block" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
