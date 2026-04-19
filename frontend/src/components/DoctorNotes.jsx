import { useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from './Toast';
import { ClipboardList, Plus, Trash2, Loader2, StickyNote, Eye, Lightbulb, Clock, Calendar } from 'lucide-react';

export default function DoctorNotes({ selectedPatient }) {
  const { addToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('observation');
  const [adding, setAdding] = useState(false);

  const fetchNotes = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      const res = await api.get(`/notes/${selectedPatient.id}`);
      setNotes(res.data);
    } catch (err) {
      addToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, [selectedPatient]);

  const handleAdd = async () => {
    if (!content.trim()) return;
    setAdding(true);
    try {
      await api.post(`/notes/${selectedPatient.id}`, { content, category });
      addToast('Note added securely', 'success');
      setContent('');
      fetchNotes();
    } catch (err) {
      addToast('Failed to add note', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      addToast('Note removed', 'success');
      fetchNotes();
    } catch (err) {
      addToast('Failed to delete note', 'error');
    }
  };

  if (!selectedPatient) {
    return (
      <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
        <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Clinical Notes</h3>
        <p style={{ fontSize: '14px' }}>Select a patient from the Dashboard to manage clinical notes</p>
      </div>
    );
  }

  const categoryIcons = { observation: Eye, suggestion: Lightbulb };
  const categoryColors = { observation: 'var(--color-cyan)', suggestion: 'var(--color-neon)' };
  const categoryLabels = { observation: 'Clinical Observation', suggestion: 'Treatment Suggestion' };

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <ClipboardList size={14} style={{ color: 'var(--color-neon)' }} />
          <span style={{ fontSize: '12px', color: 'var(--color-neon)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>Patient Records</span>
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Doctor Notes</h2>
      </div>

      <div className="glass neon-glow" style={{ padding: '24px', marginBottom: '32px', borderRadius: '16px', transition: 'all 0.3s ease' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px 30px rgba(46,230,201,0.3), 0 8px 32px rgba(0,0,0,0.3)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = ""}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {['observation', 'suggestion'].map(cat => {
            const Icon = categoryIcons[cat];
            const color = categoryColors[cat];
            const active = category === cat;
            return (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '8px 16px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer',
                background: active ? `${color}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? `${color}40` : 'var(--color-border)'}`,
                color: active ? color : 'var(--color-text-secondary)',
                fontWeight: active ? '600' : '500',
                display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
              }}>
                <Icon size={14} /> {categoryLabels[cat]}
              </button>
            );
          })}
        </div>
        <textarea className="input-field" placeholder={`Enter clinical ${category} details here...`} value={content} onChange={e => setContent(e.target.value)} style={{ minHeight: '120px', borderRadius: '14px', marginBottom: '16px', fontSize: '14px', lineHeight: '1.6' }} />
        <button onClick={handleAdd} disabled={adding || !content.trim()} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {adding ? <Loader2 size={18} className="animate-spin-slow" /> : <Plus size={18} />} Securely Add Note
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {notes.map(note => {
          const Icon = categoryIcons[note.category] || StickyNote;
          const color = categoryColors[note.category] || 'var(--color-text-muted)';
          return (
            <div key={note.id} className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', borderRadius: '8px', background: `${color}10`, border: `1px solid ${color}20` }}>
                  <Icon size={12} style={{ color }} />
                  <span style={{ fontSize: '10px', fontWeight: '700', color, textTransform: 'uppercase' }}>{note.category}</span>
                </div>
                <button onClick={() => handleDelete(note.id)} style={{ padding: '6px', cursor: 'pointer', color: 'var(--color-text-muted)', background: 'transparent', border: 'none' }}><Trash2 size={14} /></button>
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--color-text-primary)', marginBottom: '16px' }}>{note.content}</p>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {new Date(note.created_at).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
