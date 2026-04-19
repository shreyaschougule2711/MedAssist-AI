import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, UserPlus, Database, History, FileText, Activity, AlertCircle, Info, Zap, Globe } from 'lucide-react';
import api from '../api/client';

export default function GlobalRegistry() {
  const { doctor } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPatient = async (id) => {
    let targetId = id || searchId;
    if (!targetId) return;
    
    // Normalize ID Format: supports #7, ID 7, or just 7
    const cleanId = String(targetId).replace(/[^\d]/g, '').trim();
    const isLocalFormat = /^\d+$/.test(cleanId) && targetId.length < 5; // Heuristic for local vs massive UUID
    
    setLoading(true);
    setError('');
    
    try {
      if (isLocalFormat) {
        // 1. ATTEMPT LOCAL DB FETCH (Via Authenticated API)
        // Using the central 'api' client to ensure Auth Headers are included
        const response = await api.get(`/patients/${cleanId}/history_unified`);
        const data = response.data;
        setPatient({ id: `#${cleanId}`, name: data.name, age: data.age });
        setRecords(data.records || []);
      } else {
        // 2. CLOUD FIRESTORE FETCH (For UUIDs)
        if (db._app.options.apiKey === "AIzaSy_PLACEHOLDER") {
          throw new Error("PROTOTYPE CLOUD: Live Firestore not connected. Use IDs like #1, #7 to fetch from local database.");
        }
        const pDoc = await getDoc(doc(db, 'patients', targetId));
        if (pDoc.exists()) {
            setPatient({ id: pDoc.id, ...pDoc.data() });
            const rSnap = await getDocs(query(collection(db, 'patients', targetId, 'records'), orderBy('timestamp', 'desc')));
            setRecords(rSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
            setError('Global ID not found in Cloud Registry.');
            setPatient(null);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      if (isLocalFormat) {
          setError(`Patient #${cleanId} not found in the local database hub.`);
      } else {
          setError(err.message);
      }
      setPatient(null);
    }
    setLoading(false);
  };

  return (
    <div className="animated-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="neon-text" style={{ fontSize: '32px', fontWeight: '900' }}>Global Registry Hub</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Unified Cross-Doctor Intelligence Center.</p>
        </div>
        <div style={{ padding: '8px 16px', background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: '12px' }}>
             <div style={{ fontSize: '10px', color: 'var(--color-cyan)', fontWeight: '800' }}>AUTH SYNC ACTIVE</div>
        </div>
      </div>

      <div className="glass" style={{ padding: '32px', marginBottom: '32px', border: '1px solid rgba(0,245,212,0.1)' }}>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={19} style={{ position: 'absolute', left: '18px', top: '15px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID (e.g. #7, 7, or UUID)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPatient()}
              style={{ width: '100%', padding: '16px 16px 16px 52px', borderRadius: '14px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--color-border)', color: 'white', outline: 'none' }}
            />
          </div>
          <button onClick={() => fetchPatient()} disabled={loading} className="btn-primary" style={{ padding: '0 32px', height: '54px' }}>
            <Globe size={18} /> {loading ? 'Fetching...' : 'Query Databases'}
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
            <Info size={14} /> <b>Authenticated Access:</b> Fetching clinical history for <b>#7</b> automatically retrieves data from the main patient hub.
        </div>
        {error && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={14} /> {error}</div>}
      </div>

      {patient && (
        <div className="glass animated-fade-in" style={{ padding: '32px', border: '1px solid rgba(0,245,212,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px' }}>
             <div>
               <div style={{ fontSize: '11px', color: 'var(--color-neon)', fontWeight: 'bold', marginBottom: '6px' }}>RECORDS RETRIEVED: CLOUD SYNCED</div>
               <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>{patient.name}</h2>
               <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Global Tracking ID: <span style={{ color: 'var(--color-text-primary)' }}>{patient.id}</span></div>
             </div>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-neon)' }}>{patient.age}</div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>AGE INDEX</div>
             </div>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} style={{ color: 'var(--color-neon)' }} /> CLINICAL TIMELINE
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {records.length > 0 ? records.map((record, idx) => (
              <div key={idx} className="glass" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--color-neon)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-neon)' }}>{record.diagnosis}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{new Date(record.timestamp).toLocaleDateString()}</div>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>{record.report}</p>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '16px' }}>
                No active records synchronized for this ID.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
