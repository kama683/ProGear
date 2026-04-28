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
    iconBg: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
    iconGlow: 'rgba(139,92,246,0.3)',
    borderHover: 'rgba(139,92,246,0.5)',
  },
  {
    icon: ShoppingBag,
    title: 'Gear for Sale',
    description:
      'Buy professional video equipment from top brands — Sony, ARRI, DJI, Sennheiser, Aputure and more. New and certified pre-owned options available.',
    perks: ['Manufacturer warranty', 'Trade-in program', 'Installment plans'],
    iconBg: 'linear-gradient(135deg, #d946ef, #ec4899)',
    iconGlow: 'rgba(217,70,239,0.3)',
    borderHover: 'rgba(217,70,239,0.5)',
  },
  {
    icon: Headphones,
    title: '24 / 7 Support',
    description:
      'Our specialists are ready to help with gear selection, setup guidance and technical questions around the clock — before, during and after your shoot.',
    perks: ['Live chat & phone', 'On-set assistance', 'Free consultation'],
    iconBg: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
    iconGlow: 'rgba(34,211,238,0.3)',
    borderHover: 'rgba(34,211,238,0.5)',
  },
];

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="relative py-32 overflow-hidden" style={{ background: '#0d0d18' }}>
      {/* Decorative blobs */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold text-violet-400 tracking-[0.2em] uppercase mb-4 block">
            What We Do
          </span>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-6 tracking-tight">
            Everything you need for{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              the perfect shot
            </span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            ProGear is your trusted partner in professional video production —
            working with cinematographers, content creators and studios across the country.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -10 }}
                className="group relative cursor-pointer"
              >
                {/* Gradient border wrapper */}
                <div
                  className="relative p-[1px] rounded-2xl transition-all duration-500 h-full"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = `linear-gradient(135deg, ${card.borderHover}, rgba(255,255,255,0.05))`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 30px 80px ${card.iconGlow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  <div
                    className="rounded-2xl p-8 h-full flex flex-col gap-6"
                    style={{ background: 'rgba(12,12,24,0.85)', backdropFilter: 'blur(20px)' }}
                  >
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ background: card.iconBg, boxShadow: `0 8px 32px ${card.iconGlow}` }}
                    >
                      <Icon size={26} className="text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-3 flex-1">
                      <h3 className="text-xl font-bold text-white leading-snug">{card.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{card.description}</p>
                    </div>

                    {/* Perks list */}
                    <ul className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
                      {card.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2 text-sm text-zinc-400">
                          <CheckCircle size={14} className="text-violet-400 shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
