import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * GlassBanner: High-contrast Frosted Transparency Banner
 * with 3D depth, specular glass reflection, and glowing badge.
 */
export default function GlassBanner({
  badge = 'LIVE SYSTEM',
  badgeColor = 'orange',
  title,
  description,
  icon: Icon = Sparkles,
  stats = [],
  action,
  className = '',
  style = {}
}) {
  return (
    <div className={`glass-banner ${className}`} style={style}>
      <div className="glass-banner-content">
        <div className="glass-banner-icon-wrap">
          <Icon size={22} className="glass-banner-icon" />
          <span className="beacon-ping" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span className={`badge ${badgeColor}`}>{badge}</span>
            <span className="strong" style={{ fontSize: '15px', color: '#0f172a' }}>{title}</span>
          </div>
          {description && (
            <p className="muted small" style={{ margin: 0, lineHeight: 1.5 }}>
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="glass-banner-right">
        {stats && stats.length > 0 && (
          <div className="glass-banner-stats">
            {stats.map((st, i) => (
              <div key={i} className="glass-mini-stat">
                <span className="muted small" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{st.label}</span>
                <span className="strong" style={{ fontSize: '13px', color: st.color || '#0f172a' }}>{st.value}</span>
              </div>
            ))}
          </div>
        )}
        {action && (
          <div className="glass-banner-action">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
