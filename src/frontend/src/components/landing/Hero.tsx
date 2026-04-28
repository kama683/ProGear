import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Star } from 'lucide-react';
import { Camera3D } from './Camera3D';

export function Hero() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouse({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #0d0d1a 50%, #0A0A0F 100%)' }}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute animate-blob"
          style={{
            width: '700px', height: '700px',
            top: '-200px', left: '-150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute animate-blob-delayed"
          style={{
            width: '600px', height: '600px',
            top: '20%', right: '-120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute animate-blob"
          style={{
            width: '500px', height: '500px',
            bottom: '-120px', left: '35%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDelay: '4s',
          }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center min-h-[calc(100vh-200px)]">

          {/* Left: Text content */}
          <div className="flex flex-col gap-8">
            {/* Rating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-violet-300 border border-violet-500/30"
                style={{ background: 'rgba(139,92,246,0.1)' }}
              >
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse-slow" />
                Professional Cinema Gear
              </span>
              <span className="flex items-center gap-1 text-sm text-zinc-500">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="ml-1 text-zinc-400">4.9</span>
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-[82px] font-black leading-[0.92] tracking-tight text-white"
            >
              Rent or Buy
              <span
                className="block mt-2"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Pro Video
              </span>
              <span className="text-zinc-300">Gear.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-lg lg:text-xl text-zinc-400 leading-relaxed max-w-lg font-light"
            >
              Access cinema-grade cameras, lenses, stabilizers and lighting — available for
              daily rental or outright purchase. Trusted by filmmakers worldwide.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(139,92,246,0.4)]"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}
              >
                Start for Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <button
                onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-zinc-300 hover:text-white border border-white/10 hover:border-violet-500/40 rounded-2xl transition-all duration-300 hover:bg-violet-500/5 hover:scale-[1.03]"
              >
                Browse Catalog
              </button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center gap-8 pt-2"
            >
              {[
                { value: '500+', label: 'Gear items' },
                { value: '5 yrs', label: 'Experience' },
                { value: '1000+', label: 'Happy clients' },
              ].map((item) => (
                <div key={item.value} className="flex flex-col gap-0.5">
                  <span
                    className="text-2xl font-black"
                    style={{
                      background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {item.value}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: 3D Camera */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
            className="relative h-[400px] lg:h-[500px] flex items-center justify-center"
          >
            <Camera3D mouseX={mouse.x} mouseY={mouse.y} />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        >
          <button
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-center gap-1.5 text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Scroll</span>
            <ChevronDown size={18} className="animate-bounce" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
