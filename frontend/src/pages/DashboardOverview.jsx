import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from '../components/Toast';
import {
  Users, Scan, FileText, MessageSquare, Activity, TrendingUp,
  AlertTriangle, CheckCircle, Clock, ArrowRight, Sparkles,
  Heart, Brain, Shield, Loader2, UserPlus, Upload
} from 'lucide-react';

function AnimatedCounter({ end, duration = 1200, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{prefix}{count}{suffix}</span>;
}

function StatCard({ icon: Icon, label, value, color, delay, gradient }) {
  return (
    <div className="glass neon-glow animate-fadeIn stat-card" style={{
      padding: '24px', position: 'relative', overflow: 'hidden',
      animationDelay: delay, cursor: 'default',
      transition: 'all 0.3s ease', borderRadius: '20px',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = "0 0 30px rgba(46,230,201,0.15), 0 8px 32px rgba(0,0,0,0.3)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '';
    }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,212,0.05) 0%, transparent 70%)' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: gradient || 'linear-gradient(135deg, rgba(0,245,212,0.1), rgba(0,180,216,0.05))',
          border: '1px solid rgba(0,245,212,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={24} style={{ color }} />
        </div>
        <TrendingUp size={16} style={{ color: color, opacity: 0.5 }} />
      </div>
      <div className="stat-value" style={{ fontSize: '32px', fontWeight: '800', color, lineHeight: '1', marginBottom: '6px', fontFamily: "'Inter', sans-serif" }}>
        <AnimatedCounter end={value} />
      </div>
      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '500', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function SeverityRing({ high, moderate, low }) {
  const total = high + moderate + low || 1;
  const highPct = (high / total) * 100;
  const modPct = (moderate / total) * 100;
  const circumference = 2 * Math.PI * 45;
  
  return (
    <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#ff6b6b" strokeWidth="8"
          strokeDasharray={`${(highPct / 100) * circumference} ${circumference}`}
          strokeDashoffset="0" strokeLinecap="round" style={{ transition: 'all 1.5s ease' }} />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#ffd93d" strokeWidth="8"
          strokeDasharray={`${(modPct / 100) * circumference} ${circumference}`}
          strokeDashoffset={`${-(highPct / 100) * circumference}`}
          strokeLinecap="round" style={{ transition: 'all 1.5s ease' }} />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#00f5d4" strokeWidth="8"
          strokeDasharray={`${((100 - highPct - modPct) / 100) * circumference} ${circumference}`}
          strokeDashoffset={`${-((highPct + modPct) / 100) * circumference}`}
          strokeLinecap="round" style={{ transition: 'all 1.5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{total}</span>
        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</span>
      </div>
    </div>
  );
}

function ActivityItem({ item, index }) {
  const icons = { patient: Users, scan: Scan, report: FileText };
  const colors = { patient: '#00f5d4', scan: '#00b4d8', report: '#7b61ff' };
  const Icon = icons[item.type] || Activity;
  const color = colors[item.type] || '#00f5d4';
  const timeAgo = item.time ? formatTimeAgo(item.time) : '';

  return (
    <div className="animate-fadeIn" style={{
      display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
      borderRadius: '12px', background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.04)',
      transition: 'all 0.25s ease', animationDelay: `${index * 0.08}s`,
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,212,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,245,212,0.12)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: `${color}15`, border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.message}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{timeAgo}</div>
      </div>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}60`, flexShrink: 0 }} />
    </div>
  );
}

function formatTimeAgo(isoTime) {
  try {
    const diff = Date.now() - new Date(isoTime).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch { return ''; }
}

export default function DashboardOverview({ onNavigate, onSelectPatient }) {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => addToast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid rgba(0,245,212,0.1)', borderTopColor: 'var(--color-neon)', animation: 'spin-slow 1s linear infinite' }} />
            <Activity size={24} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--color-neon)' }} />
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '16px' }}>Initializing Neural Dashboard...</p>
        </div>
      </div>
    );
  }

  const sev = stats?.severity_distribution || { high: 0, moderate: 0, low: 0 };

  return (
    <div className="animate-fadeIn">
      {/* Welcome Header */}
      <div className="dashboard-welcome" style={{ marginBottom: '32px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Sparkles size={14} style={{ color: 'var(--color-neon)' }} />
          <span style={{ fontSize: '12px', color: 'var(--color-neon)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>Dashboard Overview</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px', lineHeight: '1.2' }}>
          Welcome back, <span className="neon-text">{stats?.doctor?.name || 'Doctor'}</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          {stats?.doctor?.specialty} · AI Co-Pilot System Active
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-neon)', marginLeft: '8px', boxShadow: '0 0 8px var(--color-neon)', animation: 'pulse-neon 2s ease-in-out infinite' }} />
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon={Users} label="Total Patients" value={stats?.total_patients || 0} color="#00f5d4" delay="0s" />
        <StatCard icon={Scan} label="Scans Analyzed" value={stats?.total_scans || 0} color="#00b4d8" delay="0.1s" />
        <StatCard icon={FileText} label="Reports Generated" value={stats?.total_reports || 0} color="#7b61ff" delay="0.2s" />
        <StatCard icon={MessageSquare} label="AI Consultations" value={stats?.total_chats || 0} color="#ff6b9d" delay="0.3s" />
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        {/* Recent Activity */}
        <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} style={{ color: 'var(--color-neon)' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Activity</h3>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Last 24h</span>
          </div>
          {(!stats?.recent_activity || stats.recent_activity.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
              <Activity size={36} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: '13px' }}>No recent activity yet</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>Add patients and upload scans to see activity here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {stats.recent_activity.map((item, i) => (
                <ActivityItem key={i} item={item} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="dashboard-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Severity Distribution */}
          <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--color-warning)' }} />
              Case Severity
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <SeverityRing high={sev.high} moderate={sev.moderate} low={sev.low} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'High', count: sev.high, color: '#ff6b6b' },
                  { label: 'Moderate', count: sev.moderate, color: '#ffd93d' },
                  { label: 'Normal', count: sev.low, color: '#00f5d4' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color }} />
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', minWidth: '65px' }}>{s.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: s.color }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass" style={{ padding: '24px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--color-neon)' }} />
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Add New Patient', icon: UserPlus, panel: 'patients', color: '#00f5d4' },
                { label: 'Upload Scan', icon: Upload, panel: 'upload', color: '#00b4d8' },
                { label: 'AI Chat Assistant', icon: Brain, panel: 'chat', color: '#7b61ff' },
              ].map(action => (
                <button key={action.label} onClick={() => onNavigate(action.panel)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
                  background: `${action.color}08`, cursor: 'pointer',
                  transition: 'all 0.25s ease', width: '100%', textAlign: 'left',
                  color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: '500',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = `${action.color}15`; 
                  e.currentTarget.style.borderColor = `${action.color}35`; 
                  e.currentTarget.style.transform = 'translateX(4px)'; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = `${action.color}08`; 
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; 
                  e.currentTarget.style.transform = 'none'; 
                }}>
                  <action.icon size={18} style={{ color: action.color }} />
                  <span style={{ flex: 1 }}>{action.label}</span>
                  <ArrowRight size={14} style={{ color: action.color, opacity: 0.5 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Disclaimer Banner */}
      <div style={{
        marginTop: '24px', padding: '14px 20px', borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(0,245,212,0.04), rgba(0,180,216,0.04))',
        border: '1px solid rgba(0,245,212,0.08)',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <Heart size={16} style={{ color: 'var(--color-neon)', flexShrink: 0 }} />
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
          <strong style={{ color: 'var(--color-text-secondary)' }}>MedAssist AI Co-Pilot</strong> — AI suggestions are assistive only and not a final diagnosis. All findings must be independently verified by the treating physician.
        </p>
      </div>
    </div>
  );
}
