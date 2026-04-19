import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from './Toast';
import { 
  FileText, Loader2, Printer, AlertCircle, Sparkles, Brain, 
  Download, Activity, ZoomIn, CheckCircle, Plus, Zap, ArrowRight,
  ShieldCheck, Clock, Scan, History
} from 'lucide-react';

export default function ReportView({ selectedPatient }) {
  const { addToast } = useToast();
  const [reports, setReports] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [selectedScanForGen, setSelectedScanForGen] = useState(null);

  const fetchData = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.all([
        api.get(`/reports/patient/${selectedPatient.id}`),
        api.get(`/scans/patient/${selectedPatient.id}`)
      ]);
      setReports(rRes.data);
      setScans(sRes.data);
      if (rRes.data.length > 0) {
        setActiveReport(rRes.data[0]);
        setSelectedScanForGen(null);
      } else if (sRes.data.length > 0) {
        setSelectedScanForGen(sRes.data[0]);
        setActiveReport(null);
      }
    } catch (err) {
      addToast('Failed to load clinical data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedPatient]);

  const generateReport = async (scanId) => {
    setGenerating(true);
    try {
      const res = await api.post(`/reports/generate/${scanId}`);
      setReports(prev => [res.data, ...prev]);
      setActiveReport(res.data);
      setSelectedScanForGen(null);
      addToast('AI Diagnostic Report generated successfully!', 'success');
    } catch (err) {
      addToast('AI Neural Generation failed. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!activeReport) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>MedAssist AI Report - ${selectedPatient?.name}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
        .title { color: #0f172a; margin: 0 0 10px 0; font-size: 28px; font-weight: 800; }
        .subtitle { color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
        .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .meta-item { font-size: 14px; }
        .meta-label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 12px; }
        h2 { color: #0284c7; border-bottom: 1px solid #e0f2fe; padding-bottom: 8px; margin-top: 32px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
        .section { margin: 16px 0; padding: 0 8px; }
        .disclaimer { margin-top: 40px; padding: 16px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e; font-weight: 500; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
      </head><body>
        <div class="header">
          <div>
            <h1 class="title">MedAssist AI Medical Report</h1>
            <p class="subtitle">AI Co-Pilot Diagnostic Summary</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px; font-weight: 600;">Report ID: #${activeReport.id}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">${new Date(activeReport.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div class="meta-box">
          <div class="meta-item"><span class="meta-label">Patient Name:</span> <br><strong>${selectedPatient?.name}</strong></div>
          <div class="meta-item"><span class="meta-label">Demographics:</span> <br><strong>${selectedPatient?.age} yrs, ${selectedPatient?.gender}</strong></div>
          <div class="meta-item"><span class="meta-label">AI Confidence:</span> <br><strong>${(activeReport.confidence * 100).toFixed(0)}%</strong></div>
          <div class="meta-item"><span class="meta-label">Severity Level:</span> <br><strong>${activeReport.severity}</strong></div>
        </div>
        <h2>Clinical Findings</h2><div class="section">${activeReport.findings.replace(/\n/g, '<br>')}</div>
        <h2>Diagnostic Assessment</h2><div class="section">${activeReport.diagnosis.replace(/\n/g, '<br>')}</div>
        <h2>Affected Region</h2><div class="section">${activeReport.affected_area.replace(/\n/g, '<br>')}</div>
        <h2>Recommendations & Plan</h2><div class="section">${activeReport.advice.replace(/\n/g, '<br>')}</div>
        <div class="disclaimer">⚕️ DISCLAIMER: This is an AI-generated report intended as an assistive tool only. All findings and diagnostic suggestions must be independently verified and validated by the treating physician. AI output does not constitute a final medical diagnosis.</div>
        <div class="footer">Generated by MedAssist AI Co-Pilot System • ${new Date().toLocaleString()}</div>
      </body></html>
    `);
    w.document.close();
    setTimeout(() => { w.print(); }, 250);
  };

  if (!selectedPatient) {
    return (
      <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,245,212,0.05)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          border: '1px solid rgba(0,245,212,0.1)'
        }}>
          <FileText size={40} style={{ opacity: 0.5, color: 'var(--color-neon)' }} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>AI Medical Reports</h3>
        <p style={{ fontSize: '14px', maxWidth: '300px', margin: '0 auto', lineHeight: '1.6' }}>Select a patient from the patient management hub to start generating AI-driven diagnostic reports.</p>
      </div>
    );
  }

  const unreportedScans = scans.filter(s => !reports.some(r => r.scan_id === s.id));

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Zap size={14} style={{ color: 'var(--color-neon)' }} />
            <span style={{ fontSize: '12px', color: 'var(--color-neon)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>AI Intelligence</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Clinical Report Hub</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Diagnostic data for: <strong style={{ color: 'var(--color-neon)' }}>{selectedPatient.name}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldCheck size={16} color="var(--color-neon)" />
            <span style={{ fontSize: '12px', fontWeight: '600' }}>Validated Reports: {reports.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {unreportedScans.length > 0 && (
            <div>
              <h4 style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: '700' }}>Pending Analysis</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {unreportedScans.map(s => (
                  <button key={s.id} onClick={() => { setSelectedScanForGen(s); setActiveReport(null); }} style={{
                    padding: '14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                    background: selectedScanForGen?.id === s.id ? 'rgba(0,180,216,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selectedScanForGen?.id === s.id ? 'var(--color-cyan)' : 'rgba(255,255,255,0.08)'}`,
                    color: 'var(--color-text-primary)', transition: 'all 0.2s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Brain size={16} style={{ color: 'var(--color-cyan)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700' }}>{s.scan_type} Scan</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{new Date(s.uploaded_at).toLocaleDateString()}</div>
                      </div>
                      <Plus size={14} style={{ color: 'var(--color-cyan)' }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: '700' }}>Completed Reports</h4>
            {reports.length === 0 ? (
               <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '14px' }}>
                 <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>No reports available</p>
               </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reports.map(r => (
                  <button key={r.id} onClick={() => { setActiveReport(r); setSelectedScanForGen(null); }} style={{
                    padding: '14px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                    background: activeReport?.id === r.id ? 'rgba(0,245,212,0.1)' : 'var(--color-bg-card)',
                    border: `1px solid ${activeReport?.id === r.id ? 'rgba(0,245,212,0.3)' : 'var(--color-border)'}`,
                    color: 'var(--color-text-primary)', transition: 'all 0.2s ease',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700' }}>Report #{r.id}</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      <CheckCircle size={14} style={{ color: 'var(--color-neon)' }} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ position: 'relative' }}>
          {generating && (
            <div className="glass neon-glow-strong animate-fadeIn" style={{ 
              position: 'absolute', inset: 0, zIndex: 100, display: 'flex', 
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              borderRadius: '24px', background: 'rgba(6,11,24,0.9)', backdropFilter: 'blur(10px)'
            }}>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid rgba(0,245,212,0.1)', borderTopColor: 'var(--color-neon)', animation: 'spin-slow 1s linear infinite' }} />
                <Brain size={32} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--color-neon)' }} />
              </div>
              <h3 className="neon-text" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Generating Neural Insights</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Analyzing scan patterns with Medical-LLM...</p>
            </div>
          )}

          {activeReport ? (
            <div className="glass animate-scale-in" style={{ padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span className={`badge ${activeReport.severity === 'High' ? 'badge-high' : activeReport.severity === 'Moderate' ? 'badge-moderate' : 'badge-low'}`} style={{ padding: '4px 12px', fontSize: '11px' }}>
                      {activeReport.severity} Risk Case
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600' }}>AI Confidence: {(activeReport.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <h3 style={{ fontSize: '26px', fontWeight: '800', border: 'none' }}>Diagnostic Medical Report</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Generated: {new Date(activeReport.created_at).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button className="btn-primary" onClick={handlePrint} style={{ 
                  padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
                  boxShadow: '0 0 20px rgba(0,245,212,0.2)'
                }}>
                  <Printer size={18} />
                  Print Official Copy
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div style={{ padding: '20px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700' }}>Clinical Findings</h4>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-primary)' }}>{activeReport.findings}</p>
                </div>
                <div style={{ padding: '20px', borderRadius: '18px', background: 'rgba(0,245,212,0.03)', border: '1px solid rgba(0,245,212,0.1)' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--color-neon)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700' }}>Primary Diagnosis</h4>
                  <p style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.6', color: 'var(--color-text-primary)' }}>{activeReport.diagnosis}</p>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--color-purple)', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={14} /> Affected Region & Severity
                </h4>
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-secondary)', padding: '20px', borderRadius: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}>
                  {activeReport.affected_area}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '11px', color: 'var(--color-cyan)', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} /> AI Recommendations & Plan
                </h4>
                <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--color-text-primary)', padding: '24px', borderRadius: '18px', background: 'rgba(0,180,216,0.03)', border: '1px solid rgba(0,180,216,0.1)', whiteSpace: 'pre-line' }}>
                  {activeReport.advice}
                </div>
              </div>

              <div style={{ marginTop: '32px', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Clock size={16} style={{ color: 'var(--color-text-muted)' }} />
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  This report was autonomously generated by MedAssist Neural Network. It is intended for healthcare professionals only.
                </p>
              </div>
            </div>
          ) : selectedScanForGen ? (
            <div className="glass animate-fadeIn" style={{ padding: '60px 40px', borderRadius: '24px', textAlign: 'center' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0,180,216,0.05)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                border: '1px solid rgba(0,180,216,0.2)', position: 'relative'
              }}>
                <Scan size={44} style={{ color: 'var(--color-cyan)' }} />
                <div style={{ position: 'absolute', top: -5, right: -5, width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--color-bg-primary)' }}>
                  <Zap size={14} color="#060b18" />
                </div>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Ready for Analysis</h3>
              <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                A {selectedScanForGen.scan_type} scan is available for <strong style={{color:'var(--color-text-secondary)'}}>{selectedPatient.name}</strong>. Generate an AI diagnostic report now.
              </p>
              <button className="btn-primary" onClick={() => generateReport(selectedScanForGen.id)} style={{ padding: '16px 32px', borderRadius: '16px', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 auto' }}>
                <Sparkles size={20} />
                Generate AI Clinical Report
                <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div style={{ padding: '100px 40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <History size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>No scans available for report generation.</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>Upload a new scan to start the diagnostic process.</p>
            </div>
          )}
        </div>
      </div>
    </div>
);}
