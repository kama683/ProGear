import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Camera3D } from './Camera3D';

export function Hero() {
  return (
    <section
      style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        paddingTop: '80px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 60px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '64px',
            alignItems: 'center',
            minHeight: '480px',
          }}
          className="hero-grid"
        >
          {/* Left: text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
            >
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                  fontWeight: '600', color: '#2563eb',
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
                Professional Cinema Gear
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                ))}
                <span style={{ marginLeft: '4px', fontWeight: '600' }}>4.9</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: '900',
                lineHeight: '1', letterSpacing: '-2px', color: '#0f172a',
              }}
            >
              Rent or Buy<br />
              <span style={{ color: '#3b82f6' }}>Pro Video</span><br />
              <span style={{ color: '#334155' }}>Gear.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.7', maxWidth: '440px' }}
            >
              Access cinema-grade cameras, lenses, stabilizers and lighting —
              available for daily rental or outright purchase. Trusted by filmmakers worldwide.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
            >
              <Link
                to="/register"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', fontSize: '15px', fontWeight: '700',
                  color: 'white', background: '#3b82f6', borderRadius: '10px',
                  textDecoration: 'none', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#2563eb'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#3b82f6'; }}
              >
                Start for Free
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', fontSize: '15px', fontWeight: '600',
                  color: '#374151', background: 'white', border: '1.5px solid #e2e8f0',
                  borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#94a3b8'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; }}
              >
                Browse Catalog
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{ display: 'flex', gap: '32px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}
            >
              {[
                { value: '500+', label: 'Gear items' },
                { value: '5 yrs', label: 'Experience' },
                { value: '1000+', label: 'Happy clients' },
              ].map((item) => (
                <div key={item.value}>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#3b82f6', letterSpacing: '-0.5px' }}>{item.value}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', marginTop: '2px' }}>{item.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Camera */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #f0f9ff, #eff6ff)',
              borderRadius: '20px', border: '1px solid #e0f2fe', overflow: 'hidden',
            }}
          >
            <Camera3D mouseX={0.5} mouseY={0.5} />
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  );
}
