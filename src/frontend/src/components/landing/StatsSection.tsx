import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Package, Clock, Users, Headphones } from 'lucide-react';

const stats = [
  { icon: Package, value: 500, suffix: '+', label: 'Gear Items', sub: 'in our catalog' },
  { icon: Clock, value: 5, suffix: ' yrs', label: 'In Business', sub: 'of expertise' },
  { icon: Users, value: 1000, suffix: '+', label: 'Clients', sub: 'trust ProGear' },
  { icon: Headphones, value: 24, suffix: '/7', label: 'Support', sub: 'always available' },
];

function useCounter(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

function StatCard({ icon: Icon, value, suffix, label, sub, index, active }: (typeof stats)[0] & { index: number; active: boolean }) {
  const count = useCounter(value, 2000 + index * 200, active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px',
        padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: '16px', transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} style={{ color: '#3b82f6' }} />
      </div>

      <div>
        <div style={{ fontSize: '44px', fontWeight: '900', color: '#0f172a', lineHeight: '1', letterSpacing: '-2px' }}>
          {count}
          <span style={{ color: '#3b82f6' }}>{suffix}</span>
        </div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginTop: '10px' }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{sub}</div>
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="stats" style={{ background: 'white', padding: '96px 0', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            By the Numbers
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: '900', color: '#0f172a', marginTop: '12px', letterSpacing: '-1px' }}>
            ProGear at a Glance
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="stats-grid">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} active={isInView} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .stats-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
