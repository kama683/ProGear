import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, Film, Sliders, Mic, Sun, Aperture, ArrowRight, Tag } from 'lucide-react';

const products = [
  { icon: Camera, name: 'Sony FX9', category: 'Full-Frame Cinema Camera', rental: '$199 / day', price: '$6,499', color: '#3b82f6', bg: '#eff6ff', tag: 'Best Seller' },
  { icon: Film, name: 'ARRI Alexa Mini LF', category: 'Cinema Camera', rental: '$349 / day', price: 'On Request', color: '#7c3aed', bg: '#f5f3ff', tag: 'Premium' },
  { icon: Sliders, name: 'DJI RS 3 Pro', category: '3-Axis Gimbal', rental: '$49 / day', price: '$849', color: '#0891b2', bg: '#e0f2fe', tag: 'New' },
  { icon: Mic, name: 'Sennheiser MKH 416', category: 'Shotgun Microphone', rental: '$18 / day', price: '$499', color: '#059669', bg: '#ecfdf5', tag: null },
  { icon: Sun, name: 'Aputure 600d Pro', category: 'Studio LED Light', rental: '$69 / day', price: '$1,699', color: '#d97706', bg: '#fffbeb', tag: null },
  { icon: Aperture, name: 'Zeiss CP.3 85mm', category: 'Cinema Prime Lens', rental: '$55 / day', price: '$2,599', color: '#db2777', bg: '#fdf2f8', tag: 'Popular' },
];

export function CatalogPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="catalog" style={{ background: '#f8fafc', padding: '96px 0', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', marginBottom: '48px', flexWrap: 'wrap' }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Catalog
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: '900', color: '#0f172a', marginTop: '8px', letterSpacing: '-1px' }}>
              Featured Equipment
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '10px', maxWidth: '480px' }}>
              A curated selection of our most in-demand cinema gear, available for rental or purchase.
            </p>
          </div>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', fontSize: '14px', fontWeight: '600',
              color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: '10px',
              textDecoration: 'none', background: 'white', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}
          >
            View full catalog
            <ArrowRight size={15} />
          </Link>
        </motion.div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="catalog-grid">
          {products.map((product, i) => {
            const Icon = product.icon;
            return (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px',
                  overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLDivElement).style.transform = 'none';
                }}
              >
                {/* Image area */}
                <div style={{
                  height: '160px', background: product.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', borderBottom: '1px solid #e2e8f0',
                }}>
                  <Icon size={56} style={{ color: product.color, opacity: 0.85 }} />
                  {product.tag && (
                    <span style={{
                      position: 'absolute', top: '12px', right: '12px',
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px', fontSize: '11px', fontWeight: '700',
                      color: product.color, background: 'white',
                      border: `1px solid ${product.color}30`, borderRadius: '20px',
                    }}>
                      <Tag size={9} />
                      {product.tag}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    {product.category}
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>{product.name}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Rental</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#3b82f6' }}>{product.rental}</div>
                    </div>
                    <div style={{ width: '1px', height: '28px', background: '#e2e8f0' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Buy</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{product.price}</div>
                    </div>
                  </div>

                  <Link
                    to="/login"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '9px', fontSize: '13px', fontWeight: '600',
                      color: '#3b82f6', background: '#eff6ff', border: '1px solid #bfdbfe',
                      borderRadius: '8px', textDecoration: 'none', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = '#3b82f6';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = '#eff6ff';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#3b82f6';
                    }}
                  >
                    View Details
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .catalog-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .catalog-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
