import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';

const highlights = [
  { icon: Zap, label: 'Instant Booking' },
  { icon: Shield, label: 'Insured Gear' },
  { icon: Clock, label: 'Same-Day Pickup' },
];

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section style={{ background: 'white', padding: '96px 0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            background: '#1e3a5f',
            borderRadius: '24px', padding: '64px 48px',
            textAlign: 'center',
          }}
        >
          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '36px' }}>
            {highlights.map(({ icon: Icon, label }) => (
              <span
                key={label}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', fontSize: '13px', fontWeight: '500',
                  color: '#bfdbfe', background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px',
                }}
              >
                <Icon size={13} style={{ color: '#93c5fd' }} />
                {label}
              </span>
            ))}
          </div>

          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '900', color: 'white', letterSpacing: '-1.5px', marginBottom: '16px' }}>
            Ready to shoot?
          </h2>

          <p style={{ fontSize: '16px', color: '#93c5fd', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 40px' }}>
            Create your free account in 30 seconds and get instant access to our full
            catalog — no commitments, no hidden fees.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <Link
              to="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', fontSize: '15px', fontWeight: '700',
                color: '#1e3a5f', background: 'white', borderRadius: '12px',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#eff6ff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'white'; }}
            >
              Create Free Account
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '14px 28px', fontSize: '15px', fontWeight: '600',
                color: '#bfdbfe', border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: '12px', textDecoration: 'none', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'white'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#bfdbfe'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >
              Already have an account? Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
