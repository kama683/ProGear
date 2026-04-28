import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, Film, Sliders, Mic, Sun, Aperture, ArrowRight, Tag } from 'lucide-react';

const products = [
  {
    icon: Camera,
    name: 'Sony FX9',
    category: 'Full-Frame Cinema Camera',
    rental: '$199 / day',
    price: '$6,499',
    gradient: 'from-violet-600 to-indigo-700',
    glowColor: 'rgba(139,92,246,0.45)',
    tag: 'Best Seller',
  },
  {
    icon: Film,
    name: 'ARRI Alexa Mini LF',
    category: 'Cinema Camera',
    rental: '$349 / day',
    price: 'On Request',
    gradient: 'from-blue-600 to-violet-700',
    glowColor: 'rgba(59,130,246,0.45)',
    tag: 'Premium',
  },
  {
    icon: Sliders,
    name: 'DJI RS 3 Pro',
    category: '3-Axis Gimbal',
    rental: '$49 / day',
    price: '$849',
    gradient: 'from-cyan-600 to-blue-600',
    glowColor: 'rgba(34,211,238,0.35)',
    tag: 'New',
  },
  {
    icon: Mic,
    name: 'Sennheiser MKH 416',
    category: 'Shotgun Microphone',
    rental: '$18 / day',
    price: '$499',
    gradient: 'from-emerald-600 to-teal-600',
    glowColor: 'rgba(16,185,129,0.35)',
    tag: null,
  },
  {
    icon: Sun,
    name: 'Aputure 600d Pro',
    category: 'Studio LED Light',
    rental: '$69 / day',
    price: '$1,699',
    gradient: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245,158,11,0.35)',
    tag: null,
  },
  {
    icon: Aperture,
    name: 'Zeiss CP.3 85mm',
    category: 'Cinema Prime Lens',
    rental: '$55 / day',
    price: '$2,599',
    gradient: 'from-fuchsia-600 to-pink-600',
    glowColor: 'rgba(217,70,239,0.35)',
    tag: 'Popular',
  },
];

export function CatalogPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="catalog" className="relative py-32 overflow-hidden" style={{ background: '#0d0d18' }}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <span className="text-sm font-semibold text-violet-400 tracking-[0.2em] uppercase mb-4 block">
              Catalog
            </span>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight">
              Featured{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Equipment
              </span>
            </h2>
            <p className="text-zinc-400 mt-4 max-w-lg">
              A curated selection of our most in-demand cinema gear, available for rental or purchase.
            </p>
          </div>
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-zinc-300 hover:text-white border border-white/10 hover:border-violet-500/40 rounded-xl transition-all hover:bg-violet-500/5 shrink-0"
          >
            View full catalog
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Products grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product, i) => {
            const Icon = product.icon;
            return (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="relative p-[1px] rounded-2xl overflow-hidden transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = `linear-gradient(135deg, ${product.glowColor}, rgba(255,255,255,0.05))`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 60px ${product.glowColor}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ background: 'rgba(10,10,22,0.95)', backdropFilter: 'blur(20px)' }} className="rounded-2xl overflow-hidden">
                    {/* Image area */}
                    <div className="relative h-48 flex items-center justify-center overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-90`} />
                      <div
                        className="absolute inset-0"
                        style={{ background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.2) 0%, transparent 60%)' }}
                      />
                      <Icon
                        size={72}
                        className="relative z-10 text-white/90 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.tag && (
                        <span
                          className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white rounded-full"
                          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                          <Tag size={10} />
                          {product.tag}
                        </span>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="p-5">
                      <div className="text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">{product.category}</div>
                      <h3 className="text-lg font-bold text-white mb-4">{product.name}</h3>

                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <div className="text-[11px] text-zinc-600 uppercase tracking-wide mb-0.5">Rental</div>
                          <div className="text-base font-bold text-violet-400">{product.rental}</div>
                        </div>
                        <div className="w-px h-8 bg-white/[0.06]" />
                        <div className="text-right">
                          <div className="text-[11px] text-zinc-600 uppercase tracking-wide mb-0.5">Buy</div>
                          <div className="text-sm font-semibold text-zinc-300">{product.price}</div>
                        </div>
                      </div>

                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-300 hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(217,70,239,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}
                      >
                        View Details
                        <ArrowRight size={14} />
                      </Link>
                    </div>
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
