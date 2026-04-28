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
    <footer
      id="footer"
      style={{ background: '#07070f', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.899L15 14v-4z" />
                  <rect x="3" y="6" width="12" height="12" rx="2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Pro
                <span
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Gear
                </span>
              </span>
            </Link>

            <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-xs">
              Professional cinema and video equipment for filmmakers, content creators and studios.
              Rental and sales worldwide.
            </p>

            {/* Contacts */}
            <div className="flex flex-col gap-3">
              {contacts.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.text}
                    href={c.href}
                    className="inline-flex items-start gap-3 text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <Icon size={15} className="text-violet-500 shrink-0 mt-0.5" />
                    {c.text}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-zinc-200 mb-5 tracking-wide">{title}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('#') ? (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
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
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} ProGear Inc. All rights reserved.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-600 hover:text-white transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(139,92,246,0.2)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139,92,246,0.35)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  }}
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
