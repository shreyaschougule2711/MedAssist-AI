import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ShieldCheck, User, Lock, ArrowRight, Stethoscope, Activity, Loader2, Sparkles } from 'lucide-react';

function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 212, ${p.opacity})`;
        ctx.fill();
        particles.forEach((p2, j) => {
          if (j <= i) return;
          const dx = p.x - p2.x, dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 245, 212, ${(1 - dist / 120) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
}

export default function Login() {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ medicalId: '', password: '', name: '', specialty: 'General Medicine' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.medicalId, form.name, form.specialty, form.password);
        addToast('Account created successfully! Please login.', 'success');
        setIsRegister(false);
        setForm({ ...form, medicalId: form.medicalId, password: '', name: '', specialty: 'General Medicine' });
      } else {
        await login(form.medicalId, form.password);
        addToast('Welcome back, Doctor!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.detail || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#0b0f14' }}>
      <ParticleField />
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,212,0.06) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,216,0.04) 0%, transparent 70%)' }} />

      <div className="animate-fadeIn login-wrapper" style={{ width: '100%', maxWidth: '460px', padding: '20px', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '76px', height: '76px', borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(0,245,212,0.2), rgba(0,180,216,0.1))',
            border: '1px solid rgba(0,245,212,0.3)', marginBottom: '20px',
            boxShadow: '0 0 30px rgba(0,245,212,0.15)',
          }}>
            <Stethoscope size={36} color="var(--color-neon)" />
          </div>
          <h1 className="login-title" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            <span className="neon-text">MedAssist</span> AI
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>Doctor Portal Core</p>
        </div>

        <div className="glass neon-glow-strong login-card" style={{ padding: '40px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <button onClick={() => setIsRegister(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '700',
              color: !isRegister ? 'var(--color-neon)' : 'var(--color-text-muted)', transition: 'all 0.3s ease',
              position: 'relative', padding: '0 4px',
              WebkitTapHighlightColor: 'transparent',
            }}>
              Login
              {!isRegister && <div style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '2px', background: 'var(--color-neon)', boxShadow: '0 0 10px var(--color-neon)' }} />}
            </button>
            <button onClick={() => setIsRegister(true)} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '700',
              color: isRegister ? 'var(--color-neon)' : 'var(--color-text-muted)', transition: 'all 0.3s ease',
              position: 'relative', padding: '0 4px',
              WebkitTapHighlightColor: 'transparent',
            }}>
              Register
              {isRegister && <div style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '2px', background: 'var(--color-neon)', boxShadow: '0 0 10px var(--color-neon)' }} />}
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isRegister && (
              <>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input className="input-field" placeholder="Full Professional Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ paddingLeft: '48px' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <Stethoscope size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input className="input-field" placeholder="Specialty (e.g. Radiologist)" value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} required style={{ paddingLeft: '48px' }} />
                </div>
              </>
            )}
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input className="input-field" placeholder="Medical ID / Username" value={form.medicalId} onChange={e => setForm({...form, medicalId: e.target.value})} required style={{ paddingLeft: '48px' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="password" className="input-field" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required style={{ paddingLeft: '48px' }} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{
              marginTop: '12px', height: '54px', borderRadius: '14px', fontSize: '16px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: '0 10px 20px rgba(46,230,201,0.2)'
            }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="neural-ping" style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-neon)' }} />
                  <span style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>Encrypting Neural Key...</span>
                </div>
              ) : (
                <>
                  {isRegister ? 'Initialize Account' : 'Bridge Access'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Activity size={16} color="var(--color-neon)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
              System encrypts all biometric data and medical records using AES-256 standards.
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          © 2026 MedAssist GenAI. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
