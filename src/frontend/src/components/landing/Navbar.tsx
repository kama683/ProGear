import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'About', href: 'about' },
  { label: 'Catalog', href: 'catalog' },
  { label: 'Stats', href: 'stats' },
  { label: 'Contact', href: 'footer' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: isScrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: isScrolled ? '1px solid #e2e8f0' : '1px solid transparent',
        boxShadow: isScrolled ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'white' }}>
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.899L15 14v-4z" />
                <rect x="3" y="6" width="12" height="12" rx="2" />
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Pro<span style={{ color: '#3b82f6' }}>Gear</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden-mobile">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                style={{
                  padding: '8px 16px', fontSize: '14px', fontWeight: '500',
                  color: '#475569', background: 'none', border: '1px solid #e2e8f0',
                  borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#0f172a';
                  (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#475569';
                  (e.currentTarget as HTMLButtonElement).style.background = 'none';
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="hidden-mobile">
            <Link
              to="/login"
              style={{
                padding: '8px 18px', fontSize: '14px', fontWeight: '600',
                color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                textDecoration: 'none', transition: 'all 0.15s', background: 'white',
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              style={{
                padding: '8px 18px', fontSize: '14px', fontWeight: '600',
                color: '#fff', background: '#3b82f6', borderRadius: '8px',
                textDecoration: 'none', transition: 'all 0.15s', border: 'none',
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              padding: '8px', background: 'none', border: '1px solid #e2e8f0',
              borderRadius: '8px', cursor: 'pointer', color: '#475569',
              display: 'none',
            }}
            className="show-mobile"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          style={{
            background: 'white', borderTop: '1px solid #e2e8f0',
            padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px',
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              style={{
                textAlign: 'left', padding: '10px 14px', fontSize: '14px',
                fontWeight: '500', color: '#374151', background: 'none',
                border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
              }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', marginTop: '4px' }}>
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              style={{
                textAlign: 'center', padding: '10px', fontSize: '14px', fontWeight: '600',
                color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                textDecoration: 'none', background: 'white',
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setIsMenuOpen(false)}
              style={{
                textAlign: 'center', padding: '10px', fontSize: '14px', fontWeight: '600',
                color: 'white', background: '#3b82f6', borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
