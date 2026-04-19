import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardOverview from './DashboardOverview';
import PatientPanel from '../components/PatientPanel';
import GlobalRegistry from '../components/GlobalRegistry';
import ScanUpload from '../components/ScanUpload';
import ChatAssistant from '../components/ChatAssistant';
import ReportView from '../components/ReportView';
import DoctorNotes from '../components/DoctorNotes';
import PatientHistory from '../components/PatientHistory';

export default function Dashboard() {
  const [activePanel, setActivePanel] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setActivePanel('history');
  };

  const handleNavigate = (panel) => {
    setActivePanel(panel);
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':
        return <DashboardOverview onNavigate={handleNavigate} onSelectPatient={handleViewPatient} />;
      case 'registry': return <GlobalRegistry />;
      case 'patients':
        return <PatientPanel selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} onViewPatient={handleViewPatient} />;
      case 'history':
        return <PatientHistory selectedPatient={selectedPatient} onNavigate={handleNavigate} />;
      case 'upload':
        return <ScanUpload selectedPatient={selectedPatient} />;
      case 'chat':
        return <ChatAssistant selectedPatient={selectedPatient} />;
      case 'reports':
        return <ReportView selectedPatient={selectedPatient} />;
      case 'notes':
        return <DoctorNotes selectedPatient={selectedPatient} />;
      default:
        return <DashboardOverview onNavigate={handleNavigate} onSelectPatient={handleViewPatient} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar with patient context */}
        {selectedPatient && (
          <div style={{
            padding: '10px 28px', borderBottom: '1px solid var(--color-border)',
            background: 'linear-gradient(90deg, rgba(0,245,212,0.04), rgba(0,180,216,0.02), transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--color-neon)',
                boxShadow: '0 0 8px var(--color-neon)',
                animation: 'pulse-neon 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Active Patient:</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-neon)' }}>{selectedPatient.name}</span>
              <span style={{
                fontSize: '11px', color: 'var(--color-text-muted)',
                padding: '2px 10px', borderRadius: '20px',
                background: 'rgba(0,245,212,0.08)', border: '1px solid rgba(0,245,212,0.12)',
              }}>
                {selectedPatient.age}y · {selectedPatient.gender}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setActivePanel('history')} style={{
                padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(0,245,212,0.15)',
                background: 'rgba(0,245,212,0.06)', color: 'var(--color-neon)', fontSize: '12px',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}>History</button>
              <button onClick={() => setSelectedPatient(null)} style={{
                padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--color-border)',
                background: 'transparent', color: 'var(--color-text-muted)', fontSize: '12px',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}>Clear</button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {renderPanel()}
        </div>
      </main>
    </div>
  );
}
