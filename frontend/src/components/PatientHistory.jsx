import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from './Toast';
import {
  User, Clock, Scan, FileText, ClipboardList, ChevronRight,
  AlertTriangle, CheckCircle, Loader2, Activity, Eye, Calendar
} from 'lucide-react';

export default function PatientHistory({ selectedPatient, onNavigate }) {
  const { addToast } = useToast();
  const [scans, setScans] = useState([]);
  const [reports, setReports] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedPatient) return;
    setLoading(true);
    const patientId = selectedPatient.id;
    Promise.all([
      api.get(`/scans/patient/${patientId}`).catch(() => ({ data: [] })),
      api.get(`/reports/patient/${patientId}`).catch(() => ({ data: [] })),
      api.get(`/notes/${patientId}`).catch(() => ({ data: [] })),
    ]).then(([sRes, rRes, nRes]) => {
      setScans(sRes.data);
      setReports(rRes.data);
      setNotes(nRes.data);
    }).finally(() => setLoading(false));
  }, [selectedPatient]);

  if (!selectedPatient) {
    return (
      <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
        <User size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
        <p style={{ fontWeight: '500' }}>Select a patient to view history</p>
      </div>
    );
  }

  const timeline = [
    ...scans.map(s => ({
      type: 'scan', id: `scan-${s.id}`, time: s.uploaded_at,
      title: `${s.scan_type} Scan Uploaded`,
      detail: s.analysis_result?.condition || 'Analysis pending',
      severity: s.analysis_result?.severity,
      confidence: s.analysis_result?.confidence,
      color: '#00b4d8', icon: Scan,
    })),
    ...reports.map(r => ({
      type: 'report', id: `report-${r.id}`, time: r.created_at,
      title: 'AI Report Generated',
      detail: r.diagnosis?.substring(0, 100) || 'Report available',
      severity: r.severity,
      confidence: r.confidence,
      color: '#7b61ff', icon: FileText,
    })),
    ...notes.map(n => ({
      type: 'note', id: `note-${n.id}`, time: n.created_at,
      title: `Doctor Note (${n.category})`,
      detail: n.content?.substring(0, 100) || '',
      color: '#00f5d4', icon: ClipboardList,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="animate-fadeIn">
      <div className="glass neon-glow" style={{
        padding: '28px', marginBottom: '24px', borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(10,17,40,0.9), rgba(0,245,212,0.03))',
        position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease'
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px 30px rgba(46,230,201,0.3), 0 8px 32px rgba(0,0,0,0.3)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,212,0.06), transparent 70%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--color-neon), var(--color-cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: '800', color: '#060b18', flexShrink: 0,
            boxShadow: '0 0 30px rgba(0,245,212,0.25)',
          }}>
            {selectedPatient.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>{selectedPatient.name}</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Age', value: `${selectedPatient.age} years` },
                { label: 'Gender', value: selectedPatient.gender },
                { label: 'Scans', value: scans.length },
                { label: 'Reports', value: reports.length },
                { label: 'Notes', value: notes.length },
              ].map(item => (
                <div key={item.label} style={{ fontSize: '12px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{item.label}: </span>
                  <span style={{ color: 'var(--color-neon)', fontWeight: '600' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'Upload Scan', panel: 'upload', color: '#00b4d8' },
              { label: 'AI Chat', panel: 'chat', color: '#7b61ff' },
              { label: 'Add Note', panel: 'notes', color: '#00f5d4' },
            ].map(a => (
              <button key={a.label} onClick={() => onNavigate(a.panel)} className="btn-primary" style={{
                fontSize: '11px', padding: '8px 14px',
                background: `${a.color}15`, color: a.color, borderColor: `${a.color}40`, border: '1px solid'
              }}>{a.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Clock size={18} style={{ color: 'var(--color-neon)' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Patient Timeline</h3>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', padding: '2px 10px', borderRadius: '20px', background: 'rgba(0,245,212,0.08)', border: '1px solid rgba(0,245,212,0.12)' }}>
          {timeline.length} events
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
          <Loader2 size={32} className="animate-spin-slow" style={{ margin: '0 auto 12px', color: 'var(--color-neon)' }} />
          <p>Loading patient history...</p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '32px' }}>
          <div style={{ position: 'absolute', left: '11px', top: '8px', bottom: '8px', width: '2px', background: 'linear-gradient(to bottom, var(--color-neon), rgba(0,245,212,0.05))' }} />
          {timeline.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="animate-fadeIn" style={{ marginBottom: '12px', position: 'relative', animationDelay: `${i * 0.06}s` }}>
                <div style={{
                  position: 'absolute', left: '-28px', top: '16px', width: '16px', height: '16px', borderRadius: '50%',
                  background: 'var(--color-bg-primary)', border: `2px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color }} />
                </div>
                <div className="glass" style={{ padding: '16px 20px', borderRadius: '14px', borderLeft: `3px solid ${item.color}`, transition: 'all 0.25s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={16} style={{ color: item.color }} />
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.title}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
