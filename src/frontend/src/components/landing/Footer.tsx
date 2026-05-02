import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Play, Share2, Send } from 'lucide-react';

const footerLinks = {
  Services: [
    { label: 'Equipment Rental', href: '/login' },
    { label: 'Buy Gear', href: '/login' },
    { label: 'Consultation', href: '/login' },
    { label: 'Delivery', href: '/login' },
  ],
  Company: [
    { label: 'About Us', href: '#about' },
    { label: 'Catalog', href: '#catalog' },
    { label: 'Reviews', href: '#' },
    { label: 'Partners', href: '#' },
  ],
  Account: [
    { label: 'Sign In', href: '/login' },
    { label: 'Register', href: '/register' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Orders', href: '/orders' },
  ],
};

const contacts = [
  { icon: Phone, text: '+1 (800) PRO-GEAR', href: 'tel:+18001234567' },
  { icon: Mail, text: 'hello@progear.io', href: 'mailto:hello@progear.io' },
  { icon: MapPin, text: 'Los Angeles, CA — Hollywood Studio District', href: '#' },
];

const socials = [
  { icon: Play, href: '#', label: 'YouTube' },
  { icon: Share2, href: '#', label: 'Instagram' },
  { icon: Send, href: '#', label: 'Telegram' },
];

export function Footer() {
  const scrollToSection = (id: string) => {
    if (id.startsWith('#')) {
      document.getElementById(id.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer" style={{ background: '#0f172a', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }} className="footer-grid">
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '20px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', background: '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'white' }}>
                  <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.899L15 14v-4z" />
                  <rect x="3" y="6" width="12" height="12" rx="2" />
                </svg>
              </div>
              <span style={{ fontSize: '17px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
                Pro<span style={{ color: '#3b82f6' }}>Gear</span>
              </span>
            </Link>

            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.7', maxWidth: '280px', marginBottom: '24px' }}>
              Professional cinema and video equipment for filmmakers, content creators and studios.
              Rental and sales worldwide.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {contacts.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.text}
                    href={c.href}
                    style={{
                      display: 'inline-flex', alignItems: 'flex-start', gap: '10px',
                      fontSize: '13px', color: '#475569', textDecoration: 'none', transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#475569'; }}
                  >
                    <Icon size={14} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                    {c.text}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '16px', letterSpacing: '0.03em' }}>{title}</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        style={{
                          fontSize: '13.5px', color: '#475569', background: 'none',
                          border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#475569'; }}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.href}
                        style={{ fontSize: '13.5px', color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#94a3b8'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#475569'; }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          paddingTop: '24px', borderTop: '1px solid #1e293b', flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: '13px', color: '#334155' }}>
            © {new Date().getFullYear()} ProGear Inc. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#475569', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid #1e293b', textDecoration: 'none', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#93c5fd';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#475569';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1e293b';
                  }}
                >
                  <Icon size={15} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
