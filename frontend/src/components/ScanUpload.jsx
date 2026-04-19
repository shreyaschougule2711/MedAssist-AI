import { useState } from 'react';
import api from '../api/client';
import { useToast } from './Toast';
import { 
  CloudUpload, FileImage, Cpu, CheckCircle, AlertTriangle, 
  Loader2, Maximize2, ShieldCheck, Activity, Brain, History 
} from 'lucide-react';

function ScanningAnimation() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '300px', background: '#060b18', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-neon-dim)' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(0, 245, 212, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 212, 0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="animate-scan" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: 'linear-gradient(to right, transparent, var(--color-neon), transparent)',
        boxShadow: '0 0 20px var(--color-neon)', zIndex: 10,
        animation: 'scan-move 3s ease-in-out infinite'
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Brain size={64} color="var(--color-neon)" className="animate-pulse-neon" />
          <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '2px dashed var(--color-neon)', opacity: 0.5, animation: 'spin-slow 8s linear infinite' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 className="neon-text" style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>AI BIOMETRIC SCANNING</h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>Analyzing Neural Patterns...</p>
        </div>
        <div className="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
      <style>{`
        @keyframes scan-move {
          0% { transform: translateY(0); }
          50% { transform: translateY(300px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function ScanUpload({ selectedPatient, onScanComplete }) {
  const { addToast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [scanType, setScanType] = useState('MRI');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedPatient) { addToast('Please select a patient first', 'error'); return; }
    if (!file) { addToast('Please select a scan image', 'error'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('scan_type', scanType);
      const res = await api.post(`/scans/upload/${selectedPatient.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      addToast('Scan analyzed successfully!', 'success');
      if (onScanComplete) onScanComplete(res.data);
    } catch (err) {
      addToast('Scan upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Cpu size={14} style={{ color: 'var(--color-neon)' }} />
            <span style={{ fontSize: '12px', color: 'var(--color-neon)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>Vision AI Analysis</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Medical Imaging Hub</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Current Focus: <span style={{ color: 'var(--color-neon)', fontWeight: '600' }}>{selectedPatient?.name || 'No Patient Selected'}</span>
          </p>
        </div>
        <div className="glass" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ShieldCheck size={16} color="var(--color-neon)" />
          <span style={{ fontSize: '12px', fontWeight: '600' }}>HIPAA Compliant Processing</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr' : '1fr 1fr', gap: '24px' }}>
        {!result && (
          <div className="glass neon-glow" style={{ padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px', transition: 'all 0.3s ease' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px 30px rgba(46,230,201,0.3), 0 8px 32px rgba(0,0,0,0.3)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['MRI', 'CT', 'X-RAY', 'ULTRASOUND'].map(t => (
                <button key={t} onClick={() => setScanType(t)} style={{
                  flex: 1, padding: '12px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  background: scanType === t ? 'rgba(0,245,212,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${scanType === t ? 'rgba(0,245,212,0.5)' : 'var(--color-border)'}`,
                  color: scanType === t ? 'var(--color-neon)' : 'var(--color-text-secondary)',
                  fontWeight: '700', fontSize: '12px', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                  {t}
                </button>
              ))}
            </div>

            <label style={{ 
              flex: 1, border: '2px dashed var(--color-border)', borderRadius: '20px', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', transition: 'all 0.3s ease', padding: '40px',
              background: 'rgba(255,255,255,0.01)'
            }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-neon)'; e.currentTarget.style.background = 'rgba(0,245,212,0.03)'; }}>
              <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              {preview ? (
                <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              ) : (
                <>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,245,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <CloudUpload size={32} color="var(--color-neon)" />
                  </div>
                  <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>Drop medical scan here</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Support for DICOM, PNG, JPG (max 20MB)</p>
                </>
              )}
            </label>

            <button className="btn-primary" onClick={handleUpload} disabled={uploading || !file || !selectedPatient} 
                    style={{ padding: '16px', fontSize: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              {uploading ? <Loader2 size={24} className="animate-spin-slow" /> : <Maximize2 size={20} />}
              {uploading ? 'Processing Neural Analysis...' : 'Start AI Analysis'}
            </button>
          </div>
        )}

        {uploading && <ScanningAnimation />}

        {!uploading && !result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="glass" style={{ padding: '24px', borderRadius: '20px', transition: 'all 0.3s ease' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px 30px rgba(46,230,201,0.3), 0 8px 32px rgba(0,0,0,0.3)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-neon)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vision AI Model</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                Our proprietary MedVision™ 4.0 model leverages advanced convolutional neural networks transformer blocks to identify 40+ medical abnormalities with 94.2% historical accuracy.
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="animate-scale-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass neon-glow-strong" style={{ padding: '24px', borderRadius: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--color-neon)', fontSize: '10px', color: 'var(--color-neon)', fontWeight: '800' }}>AI ANNOTATED VIEW</div>
              <img src={`/api/scans/${result.id}/annotated`} style={{ width: '100%', borderRadius: '14px', border: '1px solid var(--color-border)' }} />
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(255,107,107,0.05)', borderRadius: '12px', border: '1px solid rgba(255,107,107,0.2)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--color-danger)', fontWeight: '700', marginBottom: '4px' }}>DETECTED REGION</div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{result.analysis_result.area}</div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: 'rgba(0,245,212,0.05)', borderRadius: '12px', border: '1px solid rgba(0,245,212,0.2)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--color-neon)', fontWeight: '700', marginBottom: '4px' }}>CONFIDENCE SCORE</div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{(result.analysis_result.confidence * 100).toFixed(1)}% Match</div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass" style={{ padding: '24px', borderRadius: '24px', transition: 'all 0.3s ease' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px 30px rgba(46,230,201,0.3), 0 8px 32px rgba(0,0,0,0.3)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Analysis Result</h3>
                  <span className={`badge ${result.analysis_result.severity === 'High' ? 'badge-high' : result.analysis_result.severity === 'Moderate' ? 'badge-moderate' : 'badge-low'}`} style={{ padding: '6px 14px', fontSize: '12px' }}>{result.analysis_result.severity} Risk</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '20px' }}>
                  <CheckCircle size={20} color="var(--color-neon)" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Diagnosis Code Suggestion</div>
                    <div style={{ fontSize: '15px', fontWeight: '700' }}>{result.analysis_result.condition}</div>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Visual Findings</h4>
                  <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{result.analysis_result.findings}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setResult(null)} className="glass" style={{ flex: 1, border: '1px solid var(--color-border)', cursor: 'pointer', padding: '12px', borderRadius: '14px', fontWeight: '600', fontSize: '13px' }}>Analyze New Scan</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
