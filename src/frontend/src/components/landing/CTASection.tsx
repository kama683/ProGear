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
    <section className="relative py-32 overflow-hidden" style={{ background: '#0A0A0F' }}>
      {/* Background blobs */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none animate-blob"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />
      <div
        className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none animate-blob-delayed"
        style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.14) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden p-[1px]"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(217,70,239,0.3), rgba(34,211,238,0.2))' }}
        >
          <div
            className="relative rounded-3xl px-8 py-20 md:px-16 md:py-24 text-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f0f22, #13131f)' }}
          >
            {/* Inner glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 60%)' }}
            />

            {/* Badge row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-10"
            >
              {highlights.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-300"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Icon size={14} className="text-violet-400" />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 tracking-tight leading-[0.95]"
            >
              Ready to{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #a78bfa, #ec4899, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                shoot?
              </span>
            </motion.h2>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-zinc-400 text-lg max-w-xl mx-auto mb-12 leading-relaxed"
            >
              Create your free account in 30 seconds and get instant access to our full
              catalog — no commitments, no hidden fees.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-bold text-white rounded-2xl transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_rgba(139,92,246,0.45)]"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
              >
                Create Free Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-semibold text-zinc-300 hover:text-white border border-white/10 hover:border-violet-500/40 rounded-2xl transition-all hover:bg-violet-500/5"
              >
                Already have an account? Sign in
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
