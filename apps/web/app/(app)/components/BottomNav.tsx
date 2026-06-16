'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, UtensilsCrossed, Footprints, Moon, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/today', icon: Home, label: 'Today' },
  { href: '/meals', icon: UtensilsCrossed, label: 'Meals' },
  { href: '/steps', icon: Footprints, label: 'Steps' },
  { href: '/sleep', icon: Moon, label: 'Sleep' },
  { href: '/progress', icon: BarChart3, label: 'Progress' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
      zIndex: 150,
      boxShadow: '0 -4px 20px rgba(28,43,30,0.06)',
    }}>
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '4px 8px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: isActive ? 'var(--color-sage)' : 'var(--color-muted)',
              minWidth: '52px',
            }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: isActive ? 'var(--color-sage)' : 'transparent',
            }}>
              <Icon
                size={18}
                color={isActive ? '#fff' : 'var(--color-muted)'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.01em',
              lineHeight: 1,
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
