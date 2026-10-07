import React from 'react';

export default function Topbar({ title, actions }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div id="page-actions" style={{ display: 'flex', gap: '10px' }}>
        {actions}
      </div>
    </header>
  );
}
