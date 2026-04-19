import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from './Toast';
import { Users, Search, Plus, UserPlus, Loader2, ArrowRight, User } from 'lucide-react';

export default function PatientPanel({ selectedPatient, setSelectedPatient, onViewPatient }) {
  const { addToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Male' });

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      addToast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      // Ensure age is a number for the backend
      const patientData = { 
        ...newPatient, 
        age: parseInt(newPatient.age) || 0 
      };
      
      const res = await api.post('/patients', patientData);
      setPatients([res.data, ...patients]);
      setShowAddForm(false);
      setNewPatient({ name: '', age: '', gender: 'Male' });
      addToast('Patient registered successfully', 'success');
    } catch (err) {
      addToast('Failed to add patient', 'error');
    }
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-fadeIn">
      <div className="patient-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Users size={14} style={{ color: 'var(--color-neon)' }} />
            <span style={{ fontSize: '12px', color: 'var(--color-neon)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>Database</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Patient Management</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {patients.length} total registered patients
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <UserPlus size={16} /> Add New Patient
        </button>
      </div>

      {showAddForm && (
        <div className="glass neon-glow animate-slideUp" style={{ padding: '24px', marginBottom: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-text-primary)' }}>New Patient Registration</h3>
          <form onSubmit={handleAddPatient} className="patient-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Full Name</label>
              <input className="input-field" placeholder="Patient Name" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} required />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Age</label>
              <input type="number" className="input-field" placeholder="Age" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} required min="0" max="150" />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Gender</label>
              <select className="input-field" value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px', height: '45px' }}>Register</button>
          </form>
        </div>
      )}

      <div className="glass" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="input-field" placeholder="Search patients by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: '44px', background: 'rgba(0,0,0,0.2)', border: 'none' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
            <Loader2 size={32} className="animate-spin-slow" style={{ margin: '0 auto 12px', color: 'var(--color-neon)' }} />
            <p>Loading patient database...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
            <User size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p>No patients found</p>
          </div>
        ) : (
          <div className="patient-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--color-border)' }}>
            {filteredPatients.map(p => (
              <div key={p.id} onClick={() => { setSelectedPatient(p); onViewPatient(p); }} style={{
                padding: '24px', background: 'var(--color-bg-card)', cursor: 'pointer',
                transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '16px',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,245,212,0.03)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--color-bg-card)';
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(0,245,212,0.1), rgba(0,180,216,0.05))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: '800', color: 'var(--color-neon)', flexShrink: 0,
                }}>{p.name.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ID: #{p.id} · {p.age}y · {p.gender}</div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', opacity: 0.5, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
