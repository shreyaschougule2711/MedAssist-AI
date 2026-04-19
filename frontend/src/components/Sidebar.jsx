import { Activity, LayoutDashboard, Users, Database, Upload, MessageSquare, FileText, ClipboardList, LogOut, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'registry', label: 'Global Registry', icon: Database },
  { id: 'upload', label: 'Scan Upload', icon: Upload },
  { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'notes', label: 'Doctor Notes', icon: ClipboardList },
];

export default function Sidebar({ activePanel, setActivePanel, collapsed, setCollapsed }) {
  const { doctor, logout } = useAuth();

  return (
    <div className="glass" style={{
      width: collapsed ? '72px' : '260px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: 0,
      borderRight: '1px solid var(--color-border)',
      borderLeft: 'none',
      borderTop: 'none',
      borderBottom: 'none',
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(10,17,40,0.95) 0%, rgba(6,11,24,0.98) 100%)',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 12px' : '24px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(0,245,212,0.25), rgba(0,180,216,0.15))',
          border: '1px solid rgba(0,245,212,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 0 20px rgba(0,245,212,0.15)',
        }}>
          <Activity size={22} style={{ color: 'var(--color-neon)' }} />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: '800', fontSize: '17px', letterSpacing: '-0.3px' }}>
              <span className="neon-text">MedAssist</span>{' '}
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: '400' }}>AI</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '2px' }}>
              Co-Pilot v1.0
            </div>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button onClick={() => setCollapsed(!collapsed)} style={{
        position: 'absolute', right: '-14px', top: '72px', width: '28px', height: '28px', borderRadius: '50%',
        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-neon)'; e.currentTarget.style.color = 'var(--color-neon)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Doctor info */}
      {!collapsed && doctor && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--color-neon), var(--color-cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '15px', color: '#060b18', flexShrink: 0,
            }}>
              {doctor.name?.charAt(0) || 'D'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctor.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{doctor.specialty || doctor.medical_id}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const active = activePanel === item.id;
          return (
            <button key={item.id} onClick={() => setActivePanel(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: collapsed ? '12px' : '11px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: active ? 'linear-gradient(135deg, rgba(0,245,212,0.12), rgba(0,180,216,0.06))' : 'transparent',
              color: active ? 'var(--color-neon)' : 'var(--color-text-secondary)',
              borderLeft: active ? '3px solid var(--color-neon)' : '3px solid transparent',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '14px', fontWeight: active ? '600' : '400',
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(0,245,212,0.05)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}}>
              {active && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,245,212,0.08), transparent)', pointerEvents: 'none' }} />}
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--color-border)' }}>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: collapsed ? '12px' : '11px 16px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: '12px', border: 'none', cursor: 'pointer',
          background: 'transparent', color: 'var(--color-danger)',
          fontSize: '14px', width: '100%', transition: 'all 0.25s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Disclaimer */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: '1.4', borderTop: '1px solid var(--color-border)' }}>
          ⚕️ AI suggestions are not final diagnosis
        </div>
      )}
    </div>
  );
}
