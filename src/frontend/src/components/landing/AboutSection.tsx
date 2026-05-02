import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Camera, ShoppingBag, Headphones, CheckCircle } from 'lucide-react';

const cards = [
  {
    icon: Camera,
    title: 'Equipment Rental',
    description:
      'Cinema cameras, lenses, stabilizers and studio lighting available for daily, weekly or monthly rental. Flexible terms and transparent pricing.',
    perks: ['Same-day pickup', 'Insurance included', 'Tech support'],
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
  },
  {
    icon: ShoppingBag,
    title: 'Gear for Sale',
    description:
      'Buy professional video equipment from top brands — Sony, ARRI, DJI, Sennheiser, Aputure and more. New and certified pre-owned options available.',
    perks: ['Manufacturer warranty', 'Trade-in program', 'Installment plans'],
    iconColor: '#0891b2',
    iconBg: '#e0f2fe',
  },
  {
    icon: Headphones,
    title: '24 / 7 Support',
    description:
      'Our specialists are ready to help with gear selection, setup guidance and technical questions — before, during and after your shoot.',
    perks: ['Live chat & phone', 'On-set assistance', 'Free consultation'],
    iconColor: '#059669',
    iconBg: '#ecfdf5',
  },
];

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" style={{ background: '#f8fafc', padding: '96px 0', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            What We Do
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: '900', color: '#0f172a', marginTop: '12px', letterSpacing: '-1px' }}>
            Everything you need for the perfect shot
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', marginTop: '16px', maxWidth: '520px', margin: '16px auto 0', lineHeight: '1.7' }}>
            ProGear is your trusted partner in professional video production — working with
            cinematographers, content creators and studios across the country.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="about-grid">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px',
                  padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                <div
                  style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={22} style={{ color: card.iconColor }} />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>{card.title}</h3>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{card.description}</p>
                </div>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  {card.perks.map((perk) => (
                    <li key={perk} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <CheckCircle size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .about-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 600px) and (max-width: 900px) { .about-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </section>
  );
}
