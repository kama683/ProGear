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

function StatCard({
  icon: Icon,
  value,
  suffix,
  label,
  sub,
  index,
  active,
}: (typeof stats)[0] & { index: number; active: boolean }) {
  const count = useCounter(value, 2000 + index * 200, active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="relative group"
    >
      <div
        className="relative p-[1px] rounded-2xl transition-all duration-500"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(217,70,239,0.2))';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(139,92,246,0.2)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        <div
          className="rounded-2xl px-8 py-10 flex flex-col items-center text-center gap-5"
          style={{ background: 'rgba(10,10,20,0.8)', backdropFilter: 'blur(20px)' }}
        >
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(217,70,239,0.1))',
              border: '1px solid rgba(139,92,246,0.25)',
            }}
          >
            <Icon size={22} className="text-violet-400" />
          </div>

          {/* Counter */}
          <div>
            <div className="text-5xl font-black text-white leading-none tracking-tight">
              {count}
              <span
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {suffix}
              </span>
            </div>
            <div className="text-base font-bold text-zinc-200 mt-3">{label}</div>
            <div className="text-sm text-zinc-500 mt-1">{sub}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="stats" className="relative py-32 overflow-hidden" style={{ background: '#0A0A0F' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-400 tracking-[0.2em] uppercase mb-4 block">
            By the Numbers
          </span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight">
            ProGear{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              at a Glance
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} active={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
